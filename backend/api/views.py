# api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import SimpleRateThrottle
import boto3
from typing import Optional

from django.core.mail import send_mail
from django.core.cache import cache as _otp_cache
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.conf import settings
from .utils import upload_to_s3, delete_from_s3
from django.db import connection, models
import random
import uuid
from datetime import timedelta
import requests
from requests.auth import HTTPBasicAuth
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import (
    ExhibitorRegistration,
    VisitorRegistration,
    Category,
    Event,
    GalleryImage,
    PasswordSetupToken,
    SystemSettings,
    FranchisorRegistration,
)
from .serializers import (
    ExhibitorRegistrationSerializer,
    VisitorRegistrationSerializer,
    CategorySerializer,
    EventSerializer,
    GalleryImageSerializer,
    SystemSettingsSerializer,
    InvestorRegistrationSerializer,
    ContactInquirySerializer,
    FranchisorRegistrationSerializer,
)
from .models import InvestorRegistration, ContactInquiry
from .utils import CustomTokenObtainPairSerializer, create_tokens_for_user

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
User = get_user_model()

def _set_refresh_cookie(response: Response, refresh_token: str, role: Optional[str] = None):
    """
    Correct cross-site cookie settings:
    - DEV (localhost on different ports): SameSite=Lax (None rejected without Secure)
    - PROD (real domain + HTTPS): SameSite=None, Secure=True
    """
    DEBUG = getattr(settings, "DEBUG", False)

    if DEBUG:
        # Localhost / different ports → Lax works if both are on localhost
        secure = False
        samesite = "Lax"
        domain = None
    else:
        # Production HTTPS
        secure = True
        samesite = "None"
        
        # Role-based domain selection
        if role in ["admin", "manager", "sales"]:
            domain = ".indoglobaltradefair.com"
        elif role in ["franchisor", "investor", "exhibitor", "executive"]:
            domain = "nationalfranchiseinvestmentsummit.com"
        else:
            domain = None

    max_age_conf = getattr(settings, "SIMPLE_JWT", {}).get(
        "REFRESH_TOKEN_LIFETIME",
        timedelta(days=1)
    )
    max_age = int(max_age_conf.total_seconds())

    response.set_cookie(
        "refresh",
        refresh_token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        max_age=max_age,
        path="/",
        domain=domain
    )

def _clear_refresh_cookie(response: Response, role: Optional[str] = None):
    DEBUG = getattr(settings, "DEBUG", False)
    
    if DEBUG:
        response.delete_cookie("refresh", path="/", samesite="Lax")
    else:
        if role in ["admin", "manager", "sales"]:
            response.delete_cookie("refresh", path="/", domain=".indoglobaltradefair.com")
        elif role in ["franchisor", "investor", "exhibitor", "executive"]:
            response.delete_cookie("refresh", path="/", domain="nationalfranchiseinvestmentsummit.com")
        else:
            # Fallback: try clearing both if role is unknown
            response.delete_cookie("refresh", path="/", domain=".indoglobaltradefair.com")
            response.delete_cookie("refresh", path="/", domain="nationalfranchiseinvestmentsummit.com")
            # Also clear default domain
            response.delete_cookie("refresh", path="/")

def _user_payload(user: User):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": "admin" if user.is_superuser else getattr(user, "role", None),
        "name": user.get_full_name() or user.username,
    }

def _get_base_email() -> str:
    base = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@indoglobaltradefair.com")
    if "<" in base and ">" in base:
        return base.split("<")[1].split(">")[0].strip()
    return base

def _get_html_email(title: str, body_html: str, platform_name: str) -> str:
    return f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-bottom: 3px solid #0056b3;">
            <h2 style="color: #333; margin: 0; font-weight: 600; letter-spacing: 0.5px;">{platform_name}</h2>
        </div>
        <div style="padding: 35px 25px; background-color: #ffffff;">
            {body_html}
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #777; border-top: 1px solid #e0e0e0;">
            &copy; {timezone.now().year} {platform_name}. All rights reserved.<br>
            <span style="font-size: 11px; color: #aaa; margin-top: 8px; display: inline-block;">This is an automated message, please do not reply.</span>
        </div>
    </div>
    """

# -----------------------------------------------------------------------------
# Health & SYSTEM STATUS CHECK
# -----------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    # DB check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
        db_status = "ok"
    except Exception as e:
        return Response({
            "status": "error",
            "db": str(e),
            "under_maintenance": True,  # Force safe mode
            "date_of_online": None
        }, status=500)

    settings_obj = SystemSettings.get_settings()

    # Apply your rule: date only matters when under maintenance is true
    return Response({
        "status": "ok",
        "db": db_status,
        "under_maintenance": settings_obj.under_maintenance,
        "date_of_online": settings_obj.date_of_online if settings_obj.under_maintenance else None,
    })

# -----------------------------------------------------------------------------
# Login (TokenObtainPair) - override to set refresh cookie and return access + user
# -----------------------------------------------------------------------------
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(TokenObtainPairView):
    """
    Uses CustomTokenObtainPairSerializer which injects user_id, username,
    email, role into token and response. We override post to set refresh cookie.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        # Our CustomTokenObtainPairSerializer.validate returns:
        # {"refresh": "...", "access": "...", "user": {...}}
        refresh = validated.get("refresh")
        access = validated.get("access")
        user_obj = validated.get("user")

        origin = request.headers.get("Origin")
        if not origin:
            return Response({"detail": "Origin header missing"}, status=status.HTTP_403_FORBIDDEN)

        ADMIN_DOMAINS = settings.ADMIN_DOMAINS
        PANEL_DOMAINS = settings.PANEL_DOMAINS

        role = user_obj.get("role")

        if role in ["admin", "manager", "sales"]:
            if origin not in ADMIN_DOMAINS:
                return Response({"detail": "Admin/Staff login only allowed from main site"}, status=status.HTTP_403_FORBIDDEN)
        elif role in ["franchisor", "investor", "exhibitor", "executive"]:
            if origin not in PANEL_DOMAINS:
                return Response({"detail": "Self-service login only allowed from self-service panel"}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"detail": "Unauthorized role"}, status=status.HTTP_403_FORBIDDEN)

        resp = Response({
            "access": access,
            "user": user_obj,
        }, status=status.HTTP_200_OK)

        if refresh:
            _set_refresh_cookie(resp, refresh, role=role)

        return resp


# ---------------------------------------
# Generate Presigned Upload URL (Frontend)
# ---------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])   # Only admin/manager should upload
def generate_presigned_url(request):
    filename = request.query_params.get("filename")
    filetype = request.query_params.get("filetype")
    folder = request.query_params.get("folder", "misc")

    if not filename or not filetype:
        return Response({"error": "filename & filetype are required"}, status=400)

    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )

    # Make unique key
    ext = filename.split(".")[-1]
    unique_name = f"{uuid.uuid4()}.{ext}"
    key = f"{folder}/{unique_name}"

    # Create presigned PUT URL
    try:
        presigned_url = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "Key": key,
                "ContentType": filetype
            },
            ExpiresIn=300
        )

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    # Return final CDN or S3 URL that goes into DB
    cdn = getattr(settings, "CLOUDFRONT_URL", "").rstrip("/")
    if cdn:
        final_url = f"{cdn}/{key}"
    else:
        final_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{key}"

    return Response({
        "upload_url": presigned_url,
        "final_url": final_url
    })

# -----------------------------------------------------------------------------
# Create admin (one-time)
# -----------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def create_admin_user(request):
    """Creates default admin once (if not exists)."""
    if User.objects.filter(username='admin').exists():
        return Response({'message': 'Admin user already exists'})

    # Create using create_superuser to ensure proper flags
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        role='admin'
    )
    return Response({'message': 'Admin user created'})

# -----------------------------------------------------------------------------
# Team management (admin-only)
# -----------------------------------------------------------------------------


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_password_reset(request):
    """
    Authenticated users request a password reset.
    This creates a token and sends the user a reset link:
    frontend.com/reset-password?token=XYZ
    """
    user = request.user

    # Remove old tokens
    PasswordSetupToken.objects.filter(user=user).delete()

    # Create new token
    token_obj = PasswordSetupToken.objects.create(user=user)

    # Build reset link
    frontend = settings.FRONTEND_EMAIL_URL.rstrip("/")
    reset_link = f"{frontend}/reset-password?token={token_obj.token}"
    
    origin = request.headers.get("Origin", "")
    is_nfis = "localhost:3001" in origin or "nfis" in origin.lower()
    platform_name = "National Franchise Investment Summit" if is_nfis else "Indo Global Trade Fair"

    html_body = f"""
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Hello <strong>{user.get_full_name() or user.username}</strong>,</p>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new one. This link is valid for <strong>24 hours</strong>.</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{reset_link}" style="display: inline-block; background-color: #0056b3; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 86, 179, 0.3);">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #888; margin-top: 30px; line-height: 1.5;">If you did not request a password reset, please secure your account and ignore this message.</p>
    """

    # Send email
    send_mail(
        f"{platform_name} - Reset Your Password",
        f"Hello {user.get_full_name() or user.username},\nUse this link to reset your password:\n{reset_link}\n\nThis link expires in 24 hours.",
        f"{platform_name} <{_get_base_email()}>",
        [user.email],
        html_message=_get_html_email("Reset Your Password", html_body, platform_name)
    )

    return Response({"message": "Password reset link sent"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_team_user(request):
    """Admin-only: Create team member & send password setup email."""
    # require admin role
    if not getattr(request.user, "role", None) == "admin" and not request.user.is_superuser:
        return Response({"detail": "Only admin can create team members"}, status=403)

    name = request.data.get("name")
    email = request.data.get("email")
    role = request.data.get("role")

    if not (name and email and role):
        return Response({"detail": "Name, email & role required"}, status=400)

    if role not in ["manager", "sales", "executive"]:
        return Response({"detail": "Invalid role"}, status=400)

    # If role is executive, double check they are genuinely an admin/superuser
    if role == "executive" and not (getattr(request.user, "role", None) == "admin" or request.user.is_superuser):
        return Response({"detail": "Only superadmin can create executives"}, status=403)

    if User.objects.filter(email=email).exists():
        return Response({"detail": "User already exists"}, status=400)

    # Create inactive user with temporary username; they will set real username during password setup
    temp_username = f"pending_{uuid.uuid4().hex[:8]}"
    user = User.objects.create(
        username=temp_username,
        email=email,
        first_name=name,
        role=role,
        is_active=False,
        is_password_set=False
    )
    user.save()

    # Create token linked to user
    token_obj = PasswordSetupToken.objects.create(user=user)

    # Link to frontend
    frontend = settings.FRONTEND_EMAIL_URL.rstrip("/")
    redirect_param = "&redirect=nfis" if role == "executive" else ""
    setup_link = f"{frontend}/create-password?token={token_obj.token}{redirect_param}"
    
    origin = request.headers.get("Origin", "")
    is_nfis = "localhost:3001" in origin or "nfis" in origin.lower()
    platform_name = "National Franchise Investment Summit" if is_nfis else "Indo Global Trade Fair"

    html_body = f"""
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Hello <strong>{name}</strong>,</p>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">You have been invited to join the <strong>{platform_name}</strong> team. Click the button below to set up your account and choose a password. This invitation is valid for <strong>24 hours</strong>.</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{setup_link}" style="display: inline-block; background-color: #0056b3; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 86, 179, 0.3);">Setup My Account</a>
        </div>
        <p style="font-size: 14px; color: #888; margin-top: 30px; line-height: 1.5;">If you were not expecting this invitation, please disregard this email.</p>
    """

    # Send email
    send_mail(
        f"{platform_name} - Set Your Password",
        f"Hello {name},\nUse this link to set your password:\n{setup_link}\nThis link expires in 24 hours.",
        f"{platform_name} <{_get_base_email()}>",
        [email],
        html_message=_get_html_email("Team Invitation", html_body, platform_name)
    )

    return Response({
        "message": "Team member created, invitation sent",
        "email": email,
        "role": role
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_team_users(request):
    """List all non-admin team users (managers & sales)."""
    if not getattr(request.user, "role", None) == "admin" and not request.user.is_superuser:
        return Response({"detail": "Only admin can view team"}, status=403)

    users = User.objects.filter(role__in=["manager", "sales", "executive"]).order_by("-date_joined")
    data = [{
        "id": u.id,
        "name": u.get_full_name() or u.username,
        "username": u.username,
        "email": u.email,
        "role": u.role,
        "status": "active" if u.is_password_set else "inactive"
    } for u in users]

    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_team_user(request, user_id):
    if not getattr(request.user, "role", None) == "admin" and not request.user.is_superuser:
        return Response({"detail": "Access denied"}, status=403)

    try:
        user = User.objects.get(id=user_id, role__in=["manager", "sales", "executive"])
        user.delete()
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)

    return Response({"message": "Team member removed"})

# -----------------------------------------------------------------------------
# OTP flow  (uses Django cache — survives server reloads, auto-expires)
# -----------------------------------------------------------------------------
OTP_TTL = 5 * 60  # 5 minutes in seconds

def _otp_key(type_: str, value: str) -> str:
    return f"otp:{type_}:{value}"

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get("email")
    token = request.data.get("token")

    if not (email and token):
        return Response({"detail": "Email & token required"}, status=400)

    try:
        token_obj = PasswordSetupToken.objects.get(token=token)
    except PasswordSetupToken.DoesNotExist:
        return Response({"detail": "Invalid or expired link"}, status=400)

    # token linked to user; verify email matches
    if token_obj.user.email != email:
        return Response({"detail": "Email does not match invitation"}, status=403)

    # Generate OTP and store in cache (auto-expires in 5 min)
    otp = random.randint(100000, 999999)
    _otp_cache.set(_otp_key("email", email), otp, timeout=OTP_TTL)

    origin = request.headers.get("Origin", "")
    is_nfis = "localhost:3001" in origin or "nfis" in origin.lower()
    platform_name = "National Franchise Investment Summit" if is_nfis else "Indo Global Trade Fair"

    html_body = f"""
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Here is your One-Time Password (OTP) for account verification. This code is valid for <strong>5 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: 700; color: #0056b3; letter-spacing: 6px; background: #f0f7ff; padding: 18px 40px; border-radius: 8px; border: 2px dashed #0056b3;">
                {otp}
            </span>
        </div>
        <p style="font-size: 14px; color: #888; margin-top: 30px; line-height: 1.5;">If you did not request this OTP, please secure your account and ignore this message.</p>
    """

    send_mail(
        f"{platform_name} - Your OTP Code",
        f"Your OTP is {otp}. It expires in 5 minutes.",
        f"{platform_name} <{_get_base_email()}>",
        [email],
        html_message=_get_html_email("Your OTP Code", html_body, platform_name)
    )

    return Response({"message": "OTP sent"})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response({"detail": "Email & OTP required"}, status=400)

    stored = _otp_cache.get(_otp_key("email", email))

    if stored is None:
        return Response({"detail": "OTP not found or expired"}, status=400)

    if stored != int(otp):
        return Response({"detail": "Invalid OTP"}, status=400)

    return Response({"message": "OTP verified"})

@api_view(['POST'])
@permission_classes([AllowAny])
def send_registration_otp(request):
    type = request.data.get("type") # 'email' or 'phone'
    value = request.data.get("value")

    if not type or not value:
        return Response({"detail": "Type and value required"}, status=status.HTTP_400_BAD_REQUEST)

    otp = random.randint(100000, 999999)
    _otp_cache.set(_otp_key(type, value), otp, timeout=OTP_TTL)

    origin = request.headers.get("Origin", "")
    is_nfis = "localhost:3001" in origin or "nfis" in origin.lower()
    platform_name = "National Franchise Investment Summit" if is_nfis else "Indo Global Trade Fair"
    platform_short = "NFIS" if is_nfis else "IGTF"

    if type == 'email':
        subject = f"{platform_short} Account Verification OTP"
        text_message = f"Hello,\n\nYour OTP for verifying your {platform_name} account is {otp}. It expires in 5 minutes.\n\nBest regards,\nThe {platform_short} Team"
        
        html_body = f"""
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Use the following One-Time Password (OTP) to verify your account registration. This code is valid for <strong>5 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: 700; color: #0056b3; letter-spacing: 6px; background: #f0f7ff; padding: 18px 40px; border-radius: 8px; border: 2px dashed #0056b3;">
                {otp}
            </span>
        </div>
        <p style="font-size: 14px; color: #888; margin-top: 30px; line-height: 1.5;">If you did not request this OTP, please ignore this email.</p>
        """
        
        send_mail(
            subject=subject,
            message=text_message,
            from_email=f"{platform_name} <{_get_base_email()}>",
            recipient_list=[value],
            html_message=_get_html_email("Account Verification", html_body, platform_name)
        )
    else:
        # phone mode using Twilio REST API
        print(f"DEBUG: Sending SMS OTP {otp} to {value} via Twilio for {platform_short}")
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
            data = {
                "To": value,
                "From": settings.TWILIO_PHONE_NUMBER,
                "Body": f"Your {platform_short} verification OTP is {otp}. Valid for 5 minutes."
            }
            auth = HTTPBasicAuth(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            res = requests.post(url, data=data, auth=auth)
            
            if res.status_code not in [200, 201]:
                return Response({"detail": f"Failed to send SMS: {res.text}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({"detail": f"SMS Gateaway Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": f"OTP sent to {value}"})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_registration_otp(request):
    type = request.data.get("type")
    value = request.data.get("value")
    otp = request.data.get("otp")

    if not type or not value or not otp:
        return Response({"detail": "Type, value and OTP required"}, status=status.HTTP_400_BAD_REQUEST)

    stored = _otp_cache.get(_otp_key(type, value))

    if stored is None:
        return Response({"detail": "OTP not found or expired"}, status=status.HTTP_400_BAD_REQUEST)

    if stored != int(otp):
        return Response({"detail": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    _otp_cache.delete(_otp_key(type, value))
    return Response({"message": "OTP verified successfully"})

# -----------------------------------------------------------------------------
# Password creation (invite flow) - set password & auto-login (cookie refresh)
# -----------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def create_password(request):
    """
    Expected body:
    {
      "email": "...",
      "otp": "123456",
      "password": "newpass",
      "token": "invite-token",
      "username": "desired_username"
    }
    """
    email = request.data.get("email")
    otp = request.data.get("otp")
    password = request.data.get("password")
    token = request.data.get("token")
    username = request.data.get("username")

    if not (email and otp and password and token and username):
        return Response({"detail": "Missing required fields (email, otp, password, token, username)"}, status=400)

    # OTP VALIDATION
    stored_otp = _otp_cache.get(_otp_key("email", email))
    if stored_otp is None:
        return Response({"detail": "OTP not found or expired"}, status=400)

    if stored_otp != int(otp):
        return Response({"detail": "Invalid OTP"}, status=400)

    # TOKEN VALIDATION (1 DAY)
    try:
        token_obj = PasswordSetupToken.objects.get(token=token)
    except PasswordSetupToken.DoesNotExist:
        return Response({"detail": "Invalid link"}, status=400)

    # token_obj.user is the FK to User
    if token_obj.user.email != email:
        return Response({"detail": "Email mismatch"}, status=403)

    if not token_obj.is_valid():
        return Response({"detail": "Link expired"}, status=400)

    # SET PASSWORD + USERNAME
    user = token_obj.user

    # Check username uniqueness across users (exclude current user)
    if User.objects.filter(username=username).exclude(id=user.id).exists():
        return Response({"detail": "Username already taken"}, status=400)

    user.username = username
    user.set_password(password)
    user.mark_password_set()
    user.save()

    # Cleanup
    _otp_cache.delete(_otp_key("email", email))
    token_obj.delete()

    # Create tokens and set refresh cookie (so frontend gets access & user only)
    tokens = create_tokens_for_user(user)
    access = tokens["access"]
    refresh = tokens["refresh"]

    resp = Response({
        "message": "Password created successfully",
        "access": access,
        "user": _user_payload(user),
    }, status=status.HTTP_200_OK)

    _set_refresh_cookie(resp, refresh, role=user.role)
    return resp

# -----------------------------------------------------------------------------
# Universal login (username/password) - set cookie + return access+user
# -----------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def universal_login(request):
    """
    Single login endpoint that accepts:
    { "username": "...", "password": "..." }
    Uses Django authenticate() which works with the unified User model.
    """
    username = request.data.get("username")
    password = request.data.get("password")

    if not (username and password):
        return Response({"detail": "Username & password required"}, status=400)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"detail": "Invalid username or password"}, status=400)

    tokens = create_tokens_for_user(user)
    access = tokens["access"]
    refresh = tokens["refresh"]

    resp = Response({
        "access": access,
        "user": _user_payload(user),
    }, status=status.HTTP_200_OK)

    _set_refresh_cookie(resp, refresh, role=user.role)
    return resp

# -----------------------------------------------------------------------------
# Legacy team_login (email/username) - sets cookie + returns access+user
# -----------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def team_login(request):
    """
    Legacy: supports either:
    - { "email": "...", "password": "..." }
    - { "username": "...", "password": "..." }
    """
    email = request.data.get("email")
    username = request.data.get("username")
    password = request.data.get("password")

    if not password or (not email and not username):
        return Response({"detail": "Email/username & password required"}, status=400)

    try:
        if email:
            user = User.objects.get(email=email)
        else:
            user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"detail": "Invalid credentials"}, status=400)

    # ensure password set
    if not user.is_password_set:
        return Response({"detail": "Password not set"}, status=400)

    # check password
    if not user.check_password(password):
        return Response({"detail": "Invalid credentials"}, status=400)

    tokens = create_tokens_for_user(user)
    access = tokens["access"]
    refresh = tokens["refresh"]

    resp = Response({
        "access": access,
        "user": _user_payload(user),
    }, status=status.HTTP_200_OK)

    _set_refresh_cookie(resp, refresh, role=user.role)
    return resp

# -----------------------------------------------------------------------------
# Refresh access token using refresh cookie
# -----------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_access_from_cookie(request):
    """
    Reads refresh token from HttpOnly cookie 'refresh' and returns a fresh access token.
    Frontend must call with credentials: 'include'.
    """
    refresh_token = request.COOKIES.get("refresh")
    if not refresh_token:
        return Response({"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        refresh = RefreshToken(refresh_token)
        access = str(refresh.access_token)
    except Exception:
        return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({"access": access}, status=status.HTTP_200_OK)

# -----------------------------------------------------------------------------
# Logout - clear refresh cookie
# -----------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    resp = Response({"message": "logged out"}, status=status.HTTP_200_OK)
    role = getattr(request.user, "role", None) if request.user.is_authenticated else None
    _clear_refresh_cookie(resp, role=role)
    return resp

# -----------------------------------------------------------------------------
# Optional: /api/me/ to get server-side user info (requires Authorization with access)
# -----------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def me_view(request):
    """
    Returns authenticated user based on:
    1. Authorization: Bearer <access>  (preferred)
    2. Or refresh cookie fallback
    """
    user = request.user

    # If access token is valid → user is authenticated
    if user and user.is_authenticated:
        return Response(_user_payload(user))

    # Otherwise → try refresh cookie fallback
    refresh_token = request.COOKIES.get("refresh")
    if not refresh_token:
        return Response({"detail": "Unauthorized"}, status=401)

    try:
        refresh = RefreshToken(refresh_token)
        user_id = refresh.payload.get("user_id")
        user = User.objects.get(id=user_id)
        return Response(_user_payload(user))
    except Exception:
        return Response({"detail": "Invalid refresh token"}, status=401)


# -----------------------------------------------------------------------------
# API KEYS & PERMISSIONS
# -----------------------------------------------------------------------------
API_KEYS = {
    "key_123": "franchiseindia.com",
    "key_456": "igtf.in",
    "key_789": "nfis.in"
}

class IsAdminOrValidAPIKey(BasePermission):
    """
    Allows if User is admin/manager OR a valid X-API-KEY header is provided.
    ALSO allows ANY read-only (GET, HEAD, OPTIONS) request for public directory usage (e.g. NFIS).
    """
    def has_permission(self, request, view):
        # Allow read-only access for everyone OR public registration creation
        if request.method in SAFE_METHODS or request.method == "POST":
            return True

        # Admin / Manager / Sales / Owner fallback for writes
        if request.user and request.user.is_authenticated:
            if request.user.is_superuser or getattr(request.user, 'role', None) in ['admin', 'manager', 'sales', 'franchisor', 'investor']:
                return True
        
        # Check API KEY for external writes (if any)
        api_key = request.headers.get("X-API-KEY")
        if api_key and api_key in API_KEYS:
            return True
            
        return False

class IsAuthenticatedOrHasAPIKey(BasePermission):
    """
    Allows only if User is authenticated (admin/manager/sales/franchisor/investor)
    OR a valid X-API-KEY header is provided.
    Used for private data like Visitor (Franchisee) leads.
    """
    def has_permission(self, request, view):
        # Allow read-only access for everyone OR public creation (leads)
        if request.method in SAFE_METHODS or request.method == "POST":
            return True

        # Admin / Manager / Sales / Partner fallback
        if request.user and request.user.is_authenticated:
            if request.user.is_superuser or getattr(request.user, 'role', None) in ['admin', 'manager', 'sales', 'franchisor', 'investor']:
                return True
        
        # Check API KEY
        api_key = request.headers.get("X-API-KEY")
        if api_key and api_key in API_KEYS:
            return True
            
        return False

class APIKeyThrottle(SimpleRateThrottle):
    """
    Limits requests based on the X-API-KEY header or IP address.
    Authenticated admin/manager/sales/franchisor/investor users are fully
    exempt so the IGTF dashboard and internal tools never see 429s.
    """
    scope = 'api_key'
    # Rate is read from settings.py DEFAULT_THROTTLE_RATES['api_key']

    def get_cache_key(self, request, view):
        # Authenticated internal users → no throttle
        user = request.user
        if user and user.is_authenticated:
            role = getattr(user, 'role', None)
            if user.is_superuser or role in ['admin', 'manager', 'sales', 'franchisor', 'investor']:
                return None  # None = skip throttle for this request

        # External: throttle by API key if provided
        api_key = request.headers.get("X-API-KEY")
        if api_key:
            return self.cache_format % {
                'scope': self.scope,
                'ident': api_key
            }

        # Public/anonymous: throttle by IP (e.g. NFIS proxy, public browsers)
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }

class RegistrationCreateMixin:
    """
    Overrides create to inject source_platform.
    """
    def create(self, request, *args, **kwargs):
        # Must be mutable
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data

        # Handle file upload for logo
        if 'logo' in request.FILES:
            data['logo'] = upload_to_s3(request.FILES['logo'], folder="registrations")

        # Prevent spoofing of sensitive fields
        if isinstance(data, dict):
            for field in ['user', 'source_platform', 'api_source']:
                if field in data:
                    data.pop(field)
            
            # If logo was sent as a string (URL) but not as a file, pop it for safety
            # (unless it was just set by our S3 upload logic above)
            if 'logo' in data and 'logo' not in request.FILES:
                data.pop('logo')

        api_key = request.headers.get("X-API-KEY")
        
        if api_key in API_KEYS:
            # External submission
            if isinstance(data, dict):
                data['source_platform'] = API_KEYS[api_key]
                data['api_source'] = api_key
        else:
            # Validated by permission already
            if isinstance(data, dict):
                if not request.user.is_authenticated:
                    data['source_platform'] = 'igtf_public'
                else:
                    data['source_platform'] = 'manual'

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        instance = serializer.save()
        try:
            # Determine email and name based on model-specific fields
            email = getattr(instance, 'email_address', None) or getattr(instance, 'email', None)
            name = getattr(instance, 'contact_person_name', None) or getattr(instance, 'full_name', None)
            
            # Fallback for VisitorRegistration if name fields are missing
            if not name and hasattr(instance, 'first_name'):
                name = f"{getattr(instance, 'first_name', '')} {getattr(instance, 'last_name', '')}".strip()

            setup_link = None
            if getattr(instance, 'source_platform', None) == 'manual' and email and hasattr(instance, 'user'):
                model_name = instance.__class__.__name__
                if model_name == "ExhibitorRegistration":
                    role = "exhibitor"
                elif model_name == "FranchisorRegistration":
                    role = "franchisor"
                elif model_name == "InvestorRegistration":
                    role = "investor"
                else:
                    role = "sales"

                # Check if user already exists
                user = User.objects.filter(email=email).first()
                if not user:
                    temp_username = f"pending_{uuid.uuid4().hex[:8]}"
                    user = User.objects.create(
                        username=temp_username,
                        email=email,
                        first_name=name or '',
                        role=role,
                        is_active=False,
                        is_password_set=False
                    )
                
                # Link user to instance if not linked
                if not instance.user:
                    instance.user = user
                    instance.save(update_fields=['user'])
                
                # Create setup token if password is not set
                if not user.is_password_set:
                    PasswordSetupToken.objects.filter(user=user).delete()
                    token_obj = PasswordSetupToken.objects.create(user=user)
                    frontend = settings.FRONTEND_EMAIL_URL.rstrip("/")
                    setup_link = f"{frontend}/create-password?token={token_obj.token}&redirect=nfis"

            if email:
                self._send_thank_you_email(email, name, instance, setup_link=setup_link)
        except Exception as e:
            # We don't want to fail the registration if email fails, but we should log it
            print(f"ERROR: Failed to send onboarding email: {str(e)}")

    def _send_thank_you_email(self, email, name, instance, setup_link=None):
        # Platform detection logic for dynamic branding
        source = getattr(instance, 'source_platform', 'nfis')
        is_nfis = 'nfis' in str(source).lower()
        platform_name = "National Franchise Investment Summit" if is_nfis else "Indo Global Trade Fair"
        
        subject = f"Thank You for Registering with {platform_name}"
        
        setup_html = ""
        if setup_link:
            setup_html = f"""
            <div style="margin-top: 25px; padding: 20px; background-color: #f0f7ff; border-radius: 8px; border-left: 4px solid #0056b3;">
                <p style="font-size: 16px; color: #444; margin-top: 0;"><strong>Setup Your Account</strong></p>
                <p style="font-size: 15px; color: #555; line-height: 1.5;">Since your profile was created by our team, you can now set up a password to access your dashboard.</p>
                <div style="text-align: center; margin: 25px 0 10px 0;">
                    <a href="{setup_link}" style="display: inline-block; background-color: #0056b3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">Create Password</a>
                </div>
            </div>
            """
        
        body_html = f"""
            <p style="font-size: 16px; color: #444; line-height: 1.6;">Hello <strong>{name or 'there'}</strong>,</p>
            <p style="font-size: 16px; color: #444; line-height: 1.6;">Thank you for your interest in <strong>{platform_name}</strong>. Your profile has been successfully recorded in our system.</p>
            <p style="font-size: 16px; color: #444; line-height: 1.6;">Our executive team will review your details and get in touch with you shortly to discuss the next steps.</p>
            {setup_html}
            <div style="text-align: center; margin: 35px 0;">
                <p style="font-style: italic; color: #666;">"Empowering growth through strategic partnerships."</p>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 30px; line-height: 1.5;">If you have any immediate questions, please feel free to reach out to our support team.</p>
        """
        
        text_message = f"Hello {name or 'there'},\n\nThank you for your interest in {platform_name}. Our team will get in touch with you shortly."
        if setup_link:
            text_message += f"\n\nPlease set up your password using this link: {setup_link}"
            
        send_mail(
            subject=subject,
            message=text_message,
            from_email=f"{platform_name} <{_get_base_email()}>",
            recipient_list=[email],
            html_message=_get_html_email("Registration Success", body_html, platform_name)
        )

# -----------------------------------------------------------------------------
# CRUD viewsets (unchanged behaviour except permission classes kept)
# -----------------------------------------------------------------------------
class ExhibitorRegistrationViewSet(RegistrationCreateMixin, viewsets.ModelViewSet):
    queryset = ExhibitorRegistration.objects.all().order_by('-created_at')
    serializer_class = ExhibitorRegistrationSerializer
    permission_classes = [IsAdminOrValidAPIKey]
    throttle_classes = [APIKeyThrottle]
    pagination_class = None  # Return all results; frontends handle slicing themselves

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        # 1. Filter by owner if authenticated as franchisor (Dashboard view)
        if user.is_authenticated and getattr(user, "role", "") == "franchisor":
            return qs.filter(user=user)

        # 2. Public / External Fetching (NFIS side, no token required)
        # Search by email (useful for simpler dashboard fetching)
        email = self.request.query_params.get('email')
        if email:
            return qs.filter(email_address=email)
            
        # Search by ID
        pk = self.request.query_params.get('id')
        if pk:
            return qs.filter(id=pk)

        # 3. Filter by source_platform for public listing pages
        # e.g. NFIS passes ?source_platform=NFIS to show only its own exhibitors
        source_platform = self.request.query_params.get('source_platform')
        if source_platform:
            # Support comma-separated values e.g. "NFIS,nfis.in"
            platforms = [p.strip() for p in source_platform.split(',') if p.strip()]
            if platforms:
                qs = qs.filter(source_platform__in=platforms)
            return qs

        return qs

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        user = request.user
        
        # Intercept file upload
        data = request.data.copy()
        
        if "stall_number" in data and not user.is_superuser:
            return Response({"detail": "Only superadmin can modify stall number"}, status=status.HTTP_403_FORBIDDEN)
            
        if 'logo' in request.FILES:
            data['logo'] = upload_to_s3(request.FILES['logo'], folder="franchisor_logos")

        if "logo" in data:
            if not user.is_authenticated or not (user.is_superuser or getattr(user, 'role', None) == 'admin' or obj.user == user):
                return Response({"detail": "Not allowed to update logo"}, status=status.HTTP_403_FORBIDDEN)

        if not (user.is_superuser or getattr(user, 'role', None) in ['admin', 'manager', 'sales'] or obj.user == user):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
            
        kwargs['partial'] = True
        serializer = self.get_serializer(obj, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def occupied_stalls(self, request):
        event_name = request.query_params.get('event_name')
        qs = ExhibitorRegistration.objects.filter(status='paid')
        if event_name:
            qs = qs.filter(event_name=event_name)
        
        stall_numbers = qs.exclude(stall_number=None).exclude(stall_number='').values_list('stall_number', flat=True)
        return Response(list(set(stall_numbers)))

class VisitorRegistrationViewSet(RegistrationCreateMixin, viewsets.ModelViewSet):
    queryset = VisitorRegistration.objects.all().order_by('-created_at')
    serializer_class = VisitorRegistrationSerializer
    permission_classes = [IsAuthenticatedOrHasAPIKey]
    throttle_classes = [APIKeyThrottle]

    @action(detail=True, methods=['post'])
    def convert_to_exhibitor(self, request, pk=None):
        user = request.user
        if not user.is_superuser:
            return Response({"detail": "Only superadmin can perform this action"}, status=status.HTTP_403_FORBIDDEN)
            
        visitor = self.get_object()
        stall_number = request.data.get('stall_number', '')

        if ExhibitorRegistration.objects.filter(email_address=visitor.email_address).exists():
            return Response({"detail": "An exhibitor with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        exhibitor = ExhibitorRegistration.objects.create(
            event_location=visitor.event_location,
            event_name=visitor.event_name,
            company_name=visitor.company_name,
            contact_person_name=f"{visitor.first_name} {visitor.last_name}".strip(),
            email_address=visitor.email_address,
            contact_number=visitor.phone_number,
            product_category=visitor.industry_interest,
            stall_number=stall_number,
            source_platform=visitor.source_platform,
            api_source=visitor.api_source,
            status='paid',
        )
        visitor.delete()
        
        return Response({"detail": "Visitor converted successfully", "exhibitor_id": exhibitor.id}, status=status.HTTP_200_OK)


class InvestorRegistrationViewSet(RegistrationCreateMixin, viewsets.ModelViewSet):
    queryset = InvestorRegistration.objects.all().order_by('-created_at')
    serializer_class = InvestorRegistrationSerializer
    permission_classes = [IsAdminOrValidAPIKey]
    throttle_classes = [APIKeyThrottle]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_authenticated and getattr(user, "role", "") == "investor":
            return qs.filter(user=user)
        return qs

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        user = request.user
        
        # Intercept file upload
        data = request.data.copy()
        if 'logo' in request.FILES:
            data['logo'] = upload_to_s3(request.FILES['logo'], folder="investor_logos")
            
        if "logo" in data:
            if not user.is_authenticated or not (user.is_superuser or getattr(user, 'role', None) == 'admin' or obj.user == user):
                return Response({"detail": "Not allowed to update logo"}, status=status.HTTP_403_FORBIDDEN)

        if not (user.is_superuser or getattr(user, 'role', None) in ['admin', 'manager', 'sales'] or obj.user == user):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
            
        kwargs['partial'] = True
        serializer = self.get_serializer(obj, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def convert_to_exhibitor(self, request, pk=None):
        user = request.user
        if not (user.is_superuser or getattr(user, 'role', None) in ['admin', 'manager', 'sales']):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
            
        investor = self.get_object()

        if ExhibitorRegistration.objects.filter(email_address=investor.email).exists():
            return Response({"detail": "An exhibitor with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        exhibitor = ExhibitorRegistration.objects.create(
            company_name=investor.firm_name or investor.full_name,
            contact_person_name=investor.full_name,
            designation="Investor",
            email_address=investor.email,
            contact_number=investor.phone_number,
            product_category=investor.interested_sector or "N/A",
            company_address="N/A",
            event_location=investor.event_location or "N/A",
            event_name=investor.event_name or "IGTF",
            status="contacted",
            source_platform=investor.source_platform,
            logo=investor.logo,
        )
        
        return Response({"detail": "Investor copied to exhibitor successfully", "exhibitor_id": exhibitor.id}, status=status.HTTP_200_OK)


class FranchisorRegistrationViewSet(RegistrationCreateMixin, viewsets.ModelViewSet):
    queryset = FranchisorRegistration.objects.all().order_by('-created_at')
    serializer_class = FranchisorRegistrationSerializer
    permission_classes = [IsAdminOrValidAPIKey]
    throttle_classes = [APIKeyThrottle]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.is_authenticated and getattr(user, "role", "") == "franchisor":
            from django.db.models import Q
            return qs.filter(Q(user=user) | Q(email_address=user.email))

        email = self.request.query_params.get('email')
        if email:
            return qs.filter(email_address=email)
            
        pk = self.request.query_params.get('id')
        if pk:
            return qs.filter(id=pk)

        source_platform = self.request.query_params.get('source_platform')
        if source_platform:
            platforms = [p.strip() for p in source_platform.split(',') if p.strip()]
            if platforms:
                qs = qs.filter(source_platform__in=platforms)
            return qs

        return qs

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        user = request.user
        data = request.data.copy()
        
        if 'logo' in request.FILES:
            data['logo'] = upload_to_s3(request.FILES['logo'], folder="franchisor_logos")

        if "logo" in data:
            if not user.is_authenticated or not (user.is_superuser or getattr(user, 'role', None) == 'admin' or obj.user == user):
                return Response({"detail": "Not allowed to update logo"}, status=status.HTTP_403_FORBIDDEN)

        if not (user.is_superuser or getattr(user, 'role', None) in ['admin', 'manager', 'sales'] or obj.user == user):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
            
        kwargs['partial'] = True
        serializer = self.get_serializer(obj, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def convert_to_exhibitor(self, request, pk=None):
        user = request.user
        if not (user.is_superuser or getattr(user, 'role', None) in ['admin', 'manager', 'sales']):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
            
        franchisor = self.get_object()

        if ExhibitorRegistration.objects.filter(email_address=franchisor.email_address).exists():
            return Response({"detail": "An exhibitor with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        exhibitor = ExhibitorRegistration.objects.create(
            company_name=franchisor.company_name,
            contact_person_name=franchisor.contact_person_name or franchisor.company_name,
            designation="Franchisor",
            email_address=franchisor.email_address,
            contact_number=franchisor.contact_number,
            product_category=franchisor.industry or "N/A",
            company_address="N/A",
            event_location=franchisor.event_location or "N/A",
            event_name=franchisor.event_name or "IGTF",
            status="contacted",
            source_platform=franchisor.source_platform,
            logo=franchisor.logo,
        )
        
        return Response({"detail": "Franchisor copied to exhibitor successfully", "exhibitor_id": exhibitor.id}, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None   # 🔥 DISABLE pagination
    permission_classes = [AllowAny]

    # Accept JSON + multipart
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    http_method_names = ["get", "post", "delete"]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # CASE 1 → presigned URL already uploaded
        if "image" in data and isinstance(data["image"], str) and data["image"].startswith("http"):
            pass

        # CASE 2 → backend upload
        else:
            file_obj = request.FILES.get("image")
            if file_obj:
                url = upload_to_s3(file_obj, folder="categories")
                data["image"] = url
            else:
                return Response({"error": "Image URL or file is required"}, status=400)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def perform_destroy(self, instance):
        if instance.image:
            delete_from_s3(instance.image)
        instance.delete()


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-start_date')
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


# ==============================================================
# SYSTEM STATUS TOGGLE AND DATE OF ONLINE UPDATE BY ADMIN
# ==============================================================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_system_settings(request):
    """
    Admin-only endpoint to update maintenance mode and online date.
    """
    user = request.user
    if not (user.is_superuser or getattr(user, "role", None) == "admin"):
        return Response({"detail": "Only admin can update settings"}, status=status.HTTP_403_FORBIDDEN)

    settings_obj = SystemSettings.get_settings()
    serializer = SystemSettingsSerializer(settings_obj, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "System settings updated",
            "settings": serializer.data
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -----------------------------------------------------------------------------
# REGISTER SELF-SERVICE USER (Franchisor/Investor)
# -----------------------------------------------------------------------------
def _parse_list_field(field_value, default_val="General"):
    if not field_value:
        return default_val
    if isinstance(field_value, list):
        return ", ".join(str(item) for item in field_value if item)
    return str(field_value)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    account_type = request.data.get("account_type")
    # Support both email and email_address keys
    email = request.data.get("email") or request.data.get("email_address")
    password = request.data.get("password")
    # Default source is now igtf_public for everything on this site
    source_platform = request.data.get("source_platform", "igtf_public")
    is_email_verified = request.data.get("is_email_verified", False)
    is_phone_verified = request.data.get("is_phone_verified", False)

    # 1. CASE: FRANCHISEE (Lead only, no User account)
    if account_type == "franchisee":
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        full_name = request.data.get("full_name") or f"{first_name} {last_name}".strip()
        
        phone_number = request.data.get("phone_number") or request.data.get("contact_number") or request.data.get("phone")
        investment_budget = request.data.get("investment_budget") or request.data.get("investment_capacity")

        if not email or not full_name or not phone_number:
            return Response(
                {"detail": "full_name, email, and phone_number are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if not first_name:
            parts = full_name.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

        # Parse potential lists into comma separated strings
        raw_sector = (
            request.data.get("preferred_industry") or 
            request.data.get("interested_sector") or 
            request.data.get("industry") or
            request.data.get("industry_interest")
        )
        parsed_sector = _parse_list_field(raw_sector)
        parsed_franchisors = _parse_list_field(request.data.get("franchisor_interest") or request.data.get("interested_brands"), "")
        parsed_budget = _parse_list_field(investment_budget, "")
        parsed_experience = _parse_list_field(request.data.get("business_experience") or request.data.get("experience"), "")

        # Create lead in VisitorRegistration bucket (franchisee maps to visitor)
        instance = VisitorRegistration.objects.create(
            first_name=first_name,
            last_name=last_name,
            email_address=email,
            phone_number=phone_number,
            company_name=request.data.get("company_name", "N/A"),
            event_name=request.data.get("event_name"),
            event_location=request.data.get("preferred_location", request.data.get("event_location", "N/A")),
            industry_interest=parsed_sector,
            franchisor_interest=parsed_franchisors,
            investment_budget=parsed_budget,
            business_experience=parsed_experience,
            source_platform=source_platform,
        )

        # Send Thank You Email
        try:
            is_nfis = 'nfis' in str(source_platform).lower()
            platform_name = "NFIS" if is_nfis else "IGTF"
            
            subject = f"Registration Successful - {platform_name}"
            title = "Franchise Application Received" if account_type == "franchisee" else "Registration Success"
            
            body_html = f"""
                <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear {full_name},</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">Thank you for registering with <strong>{platform_name}</strong>. Your interest in franchise opportunities has been successfully recorded.</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">Our team will review your profile and get in touch with you shortly to discuss the potential brands and next steps.</p>
                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 15px; margin: 20px 0; border: 1px solid #eee;">
                    <p style="margin: 0; font-size: 14px; color: #666;"><strong>Registration Details:</strong></p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #444;">Name: {full_name}</p>
                    <p style="margin: 2px 0 0 0; font-size: 14px; color: #444;">Email: {email}</p>
                </div>
            """
            
            send_mail(
                subject,
                f"Hello {full_name},\n\nThank you for registering with {platform_name}. Our team will contact you soon.",
                f"{platform_name} <{_get_base_email()}>",
                [email],
                html_message=_get_html_email(title, body_html, platform_name)
            )
        except Exception as e:
            print(f"Error sending registration email: {e}")

        return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)

    # 2. CASE: Standard Registration (Franchisor/Investor)
    if account_type not in ["franchisor", "investor"]:
        return Response({"detail": "Invalid account type"}, status=status.HTTP_400_BAD_REQUEST)

    if not email or not password:
        return Response({"detail": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"detail": "Email already in use"}, status=status.HTTP_400_BAD_REQUEST)

    profile_data = {}
    if account_type == "franchisor":
        company_name = request.data.get("company_name")
        contact_person_name = request.data.get("contact_person_name")
        contact_number = request.data.get("contact_number")
        if not company_name or not contact_person_name or not contact_number:
            return Response({"detail": "company_name, contact_person_name, and contact_number are required for franchisor"}, status=status.HTTP_400_BAD_REQUEST)
        if FranchisorRegistration.objects.filter(email_address=email).exists():
            return Response({"detail": "Franchisor profile already exists"}, status=status.HTTP_400_BAD_REQUEST)
        profile_data = {
            "company_name": company_name,
            "contact_person_name": contact_person_name,
            "contact_number": contact_number,
            "industry": request.data.get("industry", ""),
            "founded_year": request.data.get("foundedYear") or request.data.get("founded_year", None),
            "units_operating": request.data.get("unitsOperating") or request.data.get("units_operating", None),
            "investment_required": request.data.get("investmentRequired") or request.data.get("investment_required", ""),
            "roi": request.data.get("roi", ""),
            "company_address": request.data.get("company_address", ""),
            "event_location": request.data.get("event_location", "Main Event"),
            "about": request.data.get("about") or request.data.get("description", None),
            "is_email_verified": is_email_verified,
            "is_phone_verified": is_phone_verified,
        }
    elif account_type == "investor":
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        full_name = request.data.get("full_name") or f"{first_name} {last_name}".strip()
        phone_number = request.data.get("phone_number") or request.data.get("contact_number")
        investment_budget = request.data.get("investment_budget") or request.data.get("investment_capacity")

        if not full_name or not phone_number:
            return Response({"detail": "full_name and phone_number are required for investor"}, status=status.HTTP_400_BAD_REQUEST)
        
        if InvestorRegistration.objects.filter(email=email).exists():
            return Response({"detail": "Investor profile already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        raw_sector = request.data.get("preferred_industries") or request.data.get("interested_sector")
        parsed_sector = _parse_list_field(raw_sector)
        parsed_budget = _parse_list_field(investment_budget, "")

        profile_data = {
            "full_name": full_name,
            "firm_name": request.data.get("firm_name") or request.data.get("finance_company_name", ""),
            "logo": request.data.get("logo") or request.data.get("firm_logo", ""),
            "phone_number": phone_number,
            "investment_budget": parsed_budget,
            "interested_sector": parsed_sector,
            "business_experience": request.data.get("business_experience") or request.data.get("experience", ""),
            "companies_financed": request.data.get("companies_financed", ""),
            "about": request.data.get("about") or request.data.get("description", None),
            "is_email_verified": is_email_verified,
            "is_phone_verified": is_phone_verified,
        }

    # Create User
    username = email.split('@')[0] + uuid.uuid4().hex[:4]
    user = User.objects.create(
        username=username,
        email=email,
        role=account_type,
        is_active=True,
        is_password_set=True
    )
    user.set_password(password)
    user.save()

    # Create Profile
    if account_type == "franchisor":
        FranchisorRegistration.objects.create(
            user=user,
            email_address=email,
            source_platform=source_platform,
            **profile_data
        )
    elif account_type == "investor":
        InvestorRegistration.objects.create(
            user=user,
            email=email,
            source_platform=source_platform,
            **profile_data
        )

    # Return tokens
    tokens = create_tokens_for_user(user)
    resp = Response({
        "access": tokens["access"],
        "user": _user_payload(user),
    }, status=status.HTTP_201_CREATED)
    _set_refresh_cookie(resp, tokens["refresh"])
    return resp

# -----------------------------------------------------------------------------
# CONTACT FORM
# -----------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def contact_form(request):
    serializer = ContactInquirySerializer(data=request.data)
    if serializer.is_valid():
        inquiry = serializer.save()
        
        # Send Thank You Email to User
        try:
            inquiry_type = inquiry.inquiry_type
            full_name = inquiry.full_name
            target_name = inquiry.target_name
            user_email = inquiry.email
            
            # Determine platform name based on source
            source = inquiry.source_platform.lower()
            platform_name = "NFIS" if "nfis" in source else "IGTF"
            
            subject = f"Thank you for your interest in {platform_name}"
            
            if inquiry_type == 'franchise':
                title = "Franchise Application Received"
                brand_text = f" for <strong>{target_name}</strong>" if target_name else ""
                body_html = f"""
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear {full_name},</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">Thank you for submitting your franchise application{brand_text}. We have received your details and our team will review them shortly.</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">Our executive will get in touch with you at the earliest to discuss the next steps.</p>
                    <div style="background-color: #f0f7ff; border-left: 4px solid #0056b3; padding: 15px; margin: 25px 0;">
                        <p style="margin: 0; font-weight: bold; color: #0056b3;">What happens next?</p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #555; font-size: 14px;">
                            <li>Profile evaluation by our team</li>
                            <li>Direct call from our brand manager</li>
                            <li>Detailed presentation of the franchise model</li>
                        </ul>
                    </div>
                """
            elif inquiry_type == 'investor':
                title = "Investment Inquiry Received"
                body_html = f"""
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear {full_name},</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">Thank you for reaching out to us regarding investment opportunities. We have received your inquiry and our investment desk will contact you soon.</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">We appreciate your interest in partnering with us.</p>
                """
            else:
                title = "Inquiry Received"
                body_html = f"""
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">Hello {full_name},</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
                """

            send_mail(
                subject,
                f"Hello {full_name},\n\nThank you for your inquiry. We have received your details and will get back to you soon.",
                f"{platform_name} <{_get_base_email()}>",
                [user_email],
                html_message=_get_html_email(title, body_html, platform_name)
            )
        except Exception as e:
            print(f"Error sending thank you email: {e}")

        return Response({"message": "Inquiry submitted"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IsAdminOrManagerStrict(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user and user.is_authenticated
            and (getattr(user, 'role', None) in ["admin", "manager"] or user.is_superuser)
        )

class ContactInquiryViewSet(viewsets.ModelViewSet):
    queryset = ContactInquiry.objects.all().order_by('-created_at')
    serializer_class = ContactInquirySerializer
    permission_classes = [IsAdminOrManagerStrict]

class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        # PUBLIC GET allowed
        if request.method == "GET":
            return True

        # UPLOAD/EDIT/DELETE → only admin/manager
        user = request.user
        return (
            user.is_authenticated
            and (user.role in ["admin", "manager"] or user.is_superuser)
        )
        
        
        
class GalleryPagination(PageNumberPagination):
    page_size = 12
    page_query_param = "p"


class GalleryImageViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryImageSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [IsAdminOrManager]
    queryset = GalleryImage.objects.all().order_by("page", "section", "display_order", "id")
    pagination_class = GalleryPagination

    http_method_names = ["get", "post", "delete", "head", "options"]

    # FILTERING
    def get_queryset(self):
        qs = GalleryImage.objects.all()
        page = self.request.query_params.get("page")
        section = self.request.query_params.get("section")

        if page:
            qs = qs.filter(page=page)

        if section:
            qs = qs.filter(section=section)

        return qs.order_by("display_order", "id")

    # CREATE 
    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        page = data.get("page")
        section = data.get("section")

        if not page or not section:
            return Response({"error": "page and section are required"}, status=400)

        existing = GalleryImage.objects.filter(page=page, section=section)

    # RULES
        if page == "about" and section == "banner" and existing.exists():
            return Response({"error": "Banner allows only 1 image."}, status=400)

        if page == "about" and section in ["why_exhibit", "why_choose_igtf"] and existing.count() >= 10:
            return Response({"error": "Max 10 images allowed."}, status=400)

        if page == "gallery" and section == "main" and existing.count() >= 5:
            return Response({"error": "Gallery main allows max 5 images."}, status=400)

    # CASE 1 — presigned URL upload (JSON)
        if "image" in data and isinstance(data["image"], str) and data["image"].startswith("http"):
            image_url = data["image"]

    # CASE 2 — backend upload (multipart)
        else:
            file_obj = request.FILES.get("image")
            if not file_obj:
                return Response({"error": "Image URL or file is required"}, status=400)
            image_url = upload_to_s3(file_obj, folder="gallery")

    # ORDER
        max_order = existing.aggregate(max=models.Max("display_order"))["max"] or 0

        create_data = {
        "page": page,
        "section": section,
        "image": image_url,
        "display_order": max_order + 1
        }

        serializer = self.get_serializer(data=create_data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        return Response(self.serializer_class(instance).data, status=201)

    # DELETE
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.image:
            delete_from_s3(instance.image)

        instance.delete()

        return Response({"message": "Deleted successfully."}, status=200)

