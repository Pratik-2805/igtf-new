# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    update_system_settings,

    # Auth
    LoginView,
    refresh_access_from_cookie,
    logout_view,
    me_view,
    request_password_reset,
    generate_presigned_url,

    # Admin creation
    create_admin_user,

    # Team management
    create_team_user,
    list_team_users,
    delete_team_user,

    # OTP + password setup
    send_otp,
    verify_otp,
    create_password,

    # CRUD ViewSets
    ExhibitorRegistrationViewSet,
    VisitorRegistrationViewSet,
    CategoryViewSet,
    EventViewSet,
    GalleryImageViewSet,
    InvestorRegistrationViewSet,
    register_user,
    send_registration_otp,
    verify_registration_otp,
    contact_form,
    ContactInquiryViewSet,
    FranchisorRegistrationViewSet,
)

# -----------------------------------------------------------------------------
# DRF Router for CRUD endpoints
# -----------------------------------------------------------------------------
router = DefaultRouter()
router.register(r'exhibitor-registrations', ExhibitorRegistrationViewSet, basename='exhibitor')
router.register(r'visitor-registrations', VisitorRegistrationViewSet, basename='visitor')
router.register(r'investor-registrations', InvestorRegistrationViewSet, basename='investor')
router.register(r'franchisor-registrations', FranchisorRegistrationViewSet, basename='franchisor')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'events', EventViewSet, basename='events')
router.register(r'gallery', GalleryImageViewSet, basename='gallery')
router.register(r'contact-inquiries', ContactInquiryViewSet, basename='contact-inquiry')

# -----------------------------------------------------------------------------
# URL patterns
# -----------------------------------------------------------------------------
urlpatterns = [

    # -----------------------------------
    # System
    # -----------------------------------
    path("system/update/", update_system_settings),

    # -----------------------------------
    # Registrations & Public Forms
    # -----------------------------------
    path("register/send-otp/", send_registration_otp),
    path("register/verify-otp/", verify_registration_otp),
    path("register/", register_user, name='register_user'),
    path("contact/", contact_form, name='contact_form'),

    # -----------------------------------
    # Authentication (Hybrid Method)
    # -----------------------------------
    path('login/', LoginView.as_view(), name='login'),
    path('token/', LoginView.as_view(), name='token_alias'),
    
    path("upload/presign/", generate_presigned_url),

    
    # Refresh access token using HttpOnly cookie
    path('token/refresh-cookie/', refresh_access_from_cookie, name='refresh_cookie'),

    # Logout (clear refresh cookie)
    path('logout/', logout_view, name='logout'),

    # Fetch logged-in user info (requires access token)
    path('me/', me_view, name='me'),
    path("password/reset/", request_password_reset),

    # -----------------------------------
    # Admin creation (first time only)
    # -----------------------------------
    path('create-admin/', create_admin_user, name='create_admin'),

    # -----------------------------------
    # Team management
    # -----------------------------------
    path('team/create/', create_team_user, name='team_create'),
    path('team/list/', list_team_users, name='team_list'),
    path('team/delete/<int:user_id>/', delete_team_user, name='team_delete'),

    # -----------------------------------
    # OTP + Password Setup
    # -----------------------------------
    path('password/send-otp/', send_otp, name='send_otp'),
    path('password/verify-otp/', verify_otp, name='verify_otp'),
    path('password/create/', create_password, name='create_password'),

    # -----------------------------------
    # CRUD Router
    # -----------------------------------
    path('', include(router.urls)),
]
