import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from datetime import timedelta


# -----------------------
# TOKEN HELPER
# -----------------------
def generate_token():
    return uuid.uuid4().hex


# =====================================================
# UNIFIED USER MODEL (Admin + Manager + Sales)
# =====================================================
class User(AbstractUser):
    ROLE_ADMIN = "admin"
    ROLE_MANAGER = "manager"
    ROLE_SALES = "sales"
    ROLE_FRANCHISOR = "franchisor"
    ROLE_INVESTOR = "investor"
    ROLE_EXECUTIVE = "executive"

    ROLE_CHOICES = (
        (ROLE_ADMIN, "Admin"),
        (ROLE_MANAGER, "Manager"),
        (ROLE_SALES, "Sales"),
        (ROLE_FRANCHISOR, "Franchisor"),
        (ROLE_INVESTOR, "Investor"),
        (ROLE_EXECUTIVE, "Executive"),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_SALES)
    is_password_set = models.BooleanField(default=False)

    REQUIRED_FIELDS = ["email"]

    def save(self, *args, **kwargs):
        # 🔥 Auto-fix: ANY superuser always gets role="admin"
        if self.is_superuser:
            self.role = self.ROLE_ADMIN
        super().save(*args, **kwargs)

    def mark_password_set(self):
        self.is_password_set = True
        self.is_active = True
        self.save(update_fields=["is_password_set", "is_active"])

    def __str__(self):
        return f"{self.username} ({self.role})"


# =====================================================
# PASSWORD SETUP TOKEN
# =====================================================
class PasswordSetupToken(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="password_tokens")
    token = models.CharField(max_length=255, default=generate_token, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() - self.created_at < timedelta(days=1)

    def __str__(self):
        return f"{self.user.email} - {self.token}"


# =====================================================
# EXHIBITOR REGISTRATION
# =====================================================
class ExhibitorRegistration(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField("User", null=True, blank=True, on_delete=models.CASCADE)
    logo = models.URLField(max_length=500, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    event_location = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    contact_person_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    email_address = models.EmailField()
    contact_number = models.CharField(max_length=20)
    product_category = models.CharField(max_length=255)
    stall_number = models.CharField(max_length=50, null=True, blank=True)
    event_name = models.CharField(max_length=255, null=True, blank=True)
    company_address = models.TextField()
    source_platform = models.CharField(max_length=255, db_index=True, default='manual')
    api_source = models.CharField(max_length=255, null=True, blank=True)

    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company_name} - {self.contact_person_name}"


# =====================================================
# FRANCHISOR REGISTRATION
# =====================================================
class FranchisorRegistration(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField("User", null=True, blank=True, on_delete=models.CASCADE)
    logo = models.URLField(max_length=500, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    company_name = models.CharField(max_length=255)
    contact_person_name = models.CharField(max_length=255, null=True, blank=True)
    designation = models.CharField(max_length=255, null=True, blank=True)
    email_address = models.EmailField(null=True, blank=True)
    contact_number = models.CharField(max_length=20, null=True, blank=True)
    
    industry = models.CharField(max_length=255, null=True, blank=True)
    product_category = models.CharField(max_length=255, null=True, blank=True)
    founded_year = models.IntegerField(null=True, blank=True)
    units_operating = models.IntegerField(null=True, blank=True)
    investment_required = models.CharField(max_length=255, null=True, blank=True)
    roi = models.CharField(max_length=255, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    
    # New Detailed Form Additions
    franchise_fee = models.CharField(max_length=255, null=True, blank=True)
    royalty = models.CharField(max_length=255, null=True, blank=True)
    space_requirement = models.CharField(max_length=255, null=True, blank=True)
    location_type = models.CharField(max_length=255, null=True, blank=True)
    break_even = models.CharField(max_length=255, null=True, blank=True)
    cities = models.TextField(null=True, blank=True, help_text="Comma separated cities")
    training_support = models.BooleanField(default=False)
    setup_support = models.BooleanField(default=False)
    marketing_support = models.BooleanField(default=False)
    
    company_address = models.TextField(null=True, blank=True)
    event_location = models.CharField(max_length=255, null=True, blank=True)
    event_name = models.CharField(max_length=255, null=True, blank=True)

    source_platform = models.CharField(max_length=255, db_index=True, default='nfis')
    api_source = models.CharField(max_length=255, null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company_name} - {self.contact_person_name}"

# =====================================================
# VISITOR REGISTRATION
# =====================================================
class VisitorRegistration(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    event_location = models.CharField(max_length=255)
    event_name = models.CharField(max_length=255, null=True, blank=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    email_address = models.EmailField()
    phone_number = models.CharField(max_length=20)
    industry_interest = models.CharField(max_length=255)
    franchisor_interest = models.TextField(blank=True, null=True)
    
    # Extra fields for NFIS Franchisee leads
    investment_budget = models.CharField(max_length=255, null=True, blank=True)
    business_experience = models.CharField(max_length=255, null=True, blank=True)

    source_platform = models.CharField(max_length=255, db_index=True, default='manual')
    api_source = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.company_name}"


# =====================================================
# INVESTOR REGISTRATION
# =====================================================
class InvestorRegistration(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('converted', 'Converted'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField("User", null=True, blank=True, on_delete=models.CASCADE)
    logo = models.URLField(max_length=500, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    full_name = models.CharField(max_length=255)
    firm_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    investment_budget = models.CharField(max_length=255)
    interested_sector = models.CharField(max_length=255)
    preferred_location = models.CharField(max_length=255, null=True, blank=True)
    event_name = models.CharField(max_length=255, null=True, blank=True)
    event_location = models.CharField(max_length=255, null=True, blank=True)
    business_experience = models.CharField(max_length=255, null=True, blank=True)
    companies_financed = models.CharField(max_length=255, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    source_platform = models.CharField(max_length=255, db_index=True, default='manual')
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.investment_budget}"


# =====================================================
# CATEGORY
# =====================================================
class Category(models.Model):
    name = models.CharField(max_length=200)
    image = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


# =====================================================
# EVENT
# =====================================================
class Event(models.Model):
    title = models.CharField(max_length=200)
    location = models.TextField()
    venue = models.CharField(max_length=200, default="")
    start_date = models.DateField()
    end_date = models.DateField()
    time_schedule = models.CharField(max_length=100, default="10:00 AM - 7:00 PM")
    exhibitors_count = models.CharField(max_length=50, default="400+")
    buyers_count = models.CharField(max_length=50, default="6000+")
    countries_count = models.CharField(max_length=50, default="40+")
    sectors_count = models.CharField(max_length=50, default="16")
    is_active = models.BooleanField(default=True)
    opt_out_date = models.BooleanField(default=False)
    has_stall_layout = models.BooleanField(default=False)
    image = models.URLField(max_length=500, null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_date']

    def __str__(self):
        return self.title


# =====================================================
# SECTOR
# =====================================================
class Sector(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="sectors")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.event.title})"


# =====================================================
# GALLERY IMAGE
# =====================================================
class GalleryImage(models.Model):
    PAGE_CHOICES = [
        ("home", "Home"),
        ("about", "About"),
        ("gallery", "Gallery"),
    ]

    SECTION_CHOICES = [
        # Home
        ("hero", "Hero"),
        ("below_hero", "Below Hero"),

        # About
        ("banner", "Banner"),
        ("why_exhibit", "Why Exhibit"),
        ("why_choose_igtf", "Why Choose IGTF"),

        # Gallery
        ("main", "Gallery Main"),
        ("exhibition_moments", "Exhibition Moments"),
    ]

    page = models.CharField(max_length=50, choices=PAGE_CHOICES)
    section = models.CharField(max_length=50, choices=SECTION_CHOICES)

    image = models.URLField(max_length=500, null=True, blank=True)

    display_order = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["page", "section", "display_order", "id"]

    def __str__(self):
        return f"{self.page} - {self.section}"
 

# =====================================================
# SYSTEM STATUS AND DATE OF ONLINE
# =====================================================


class SystemSettings(models.Model):
    under_maintenance = models.BooleanField(default=False)
    date_of_online = models.DateTimeField(null=True, blank=True)

    # Always return the single instance
    @staticmethod
    def get_settings():
        obj, created = SystemSettings.objects.get_or_create(id=1)
        return obj

    def __str__(self):
        return "System Settings (Singleton)"

# =====================================================
# CONTACT INQUIRY
# =====================================================
class ContactInquiry(models.Model):
    INQUIRY_TYPE_CHOICES = [
        ('franchise', 'Franchise Application'),
        ('investor', 'Investor Inquiry'),
        ('general', 'General Contact'),
    ]
    inquiry_type = models.CharField(max_length=20, choices=INQUIRY_TYPE_CHOICES, default='general')
    target_name = models.CharField(max_length=255, null=True, blank=True, help_text="Brand or Investor name")
    
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    business_type = models.CharField(max_length=255, null=True, blank=True)
    investment_capacity = models.CharField(max_length=255, null=True, blank=True)
    message = models.TextField()
    source_platform = models.CharField(max_length=255, db_index=True, default='igtf')
    is_email_verified = models.BooleanField(default=False)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.inquiry_type}"

class FranchiseInquiry(ContactInquiry):
    class Meta:
        proxy = True
        verbose_name = "Franchise Application"
        verbose_name_plural = "Franchise Applications"

class InvestorInquiry(ContactInquiry):
    class Meta:
        proxy = True
        verbose_name = "Investor Inquiry"
        verbose_name_plural = "Investor Inquiries"

# =====================================================
# SIGNALS TO CLEAN UP RELATED USERS
# =====================================================
from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=ExhibitorRegistration)
@receiver(post_delete, sender=FranchisorRegistration)
@receiver(post_delete, sender=InvestorRegistration)
def auto_delete_user_with_registration(sender, instance, **kwargs):
    """
    Deletes the linked User account when the registration is deleted from the DB.
    """
    if instance.user_id:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        User.objects.filter(id=instance.user_id).delete()
