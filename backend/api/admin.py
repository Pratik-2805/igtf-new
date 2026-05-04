from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    ExhibitorRegistration,
    VisitorRegistration,
    InvestorRegistration,
    Category,
    Event,
    GalleryImage,
    User,
    PasswordSetupToken,
    ContactInquiry,
    FranchiseInquiry,
    InvestorInquiry,
    Sector,
)


# ===============================
# CUSTOM USER ADMIN (Unified User)
# ===============================
@admin.register(User)
class UserAdmin(BaseUserAdmin):

    # Columns in admin list view
    list_display = (
        "id",
        "get_full_name",
        "username",
        "email",
        "role",
        "is_active",
        "is_password_set",
        "date_joined",
        "last_login",
        "is_superuser",
    )

    list_filter = ("role", "is_active", "is_superuser", "is_password_set")

    search_fields = ("username", "email", "first_name", "last_name")

    ordering = ("id",)

    # Hide Django’s built-in staff flag since you don’t use it
    exclude = ("is_staff",)

    # computed full name
    def get_full_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full or "(No Name)"
    get_full_name.short_description = "Name"

    # User edit form layout
    fieldsets = (
        ("Login Details", {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email")}),
        ("Role & Access", {
            "fields": (
                "role",
                "is_active",
                "is_superuser",
                "is_password_set",
            )
        }),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    # User create form layout
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username",
                "email",
                "role",
                "password1",
                "password2",
            ),
        }),
    )


# ===============================
# PASSWORD TOKEN
# ===============================
@admin.register(PasswordSetupToken)
class PasswordSetupTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "token", "created_at")
    search_fields = ("user__email", "token")
    readonly_fields = ("created_at",)


# ===============================
# EXHIBITOR REGISTRATION
# ===============================
@admin.register(ExhibitorRegistration)
class ExhibitorRegistrationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company_name",
        "contact_person_name",
        "email_address",
        "contact_number",
        "product_category",
        "stall_number",
        "event_name",
        "status",
        "get_source_display",
        "get_api_source_display",
        "created_at",
    )
    readonly_fields = ("created_at", "updated_at", "source_platform", "api_source")
    list_filter = ("status", "source_platform", "event_name", "event_location")
    search_fields = ("company_name", "contact_person_name", "email_address", "stall_number")

    fieldsets = (
        ("Basic Info", {
            "fields": ("status", "company_name", "logo", "event_name", "event_location")
        }),
        ("Contact Details", {
            "fields": ("contact_person_name", "designation", "email_address", "contact_number", "company_address")
        }),
        ("Stall Booking", {
            "fields": ("stall_number", "product_category")
        }),
        ("Business Interest (NFIS)", {
            "classes": ("collapse",),
            "fields": ("industry", "founded_year", "units_operating", "investment_required", "roi", "about")
        }),
        ("System Info", {
            "fields": ("source_platform", "api_source", "is_email_verified", "is_phone_verified", "created_at", "updated_at")
        }),
    )

    def get_source_display(self, obj):
        s = (obj.source_platform or "").lower()
        if "nfis" in s: return "NFIS"
        if "igtf" in s: return "IGTF"
        return s.upper()
    get_source_display.short_description = "Source"

    def get_api_source_display(self, obj):
        s = (obj.api_source or "").lower()
        if "nfis" in s: return "NFIS"
        if "igtf" in s: return "IGTF"
        return s.upper() if s else "-"
    get_api_source_display.short_description = "API Source"


# ===============================
# VISITOR REGISTRATION
# ===============================
@admin.register(VisitorRegistration)
class VisitorRegistrationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "first_name",
        "last_name",
        "company_name",
        "email_address",
        "phone_number",
        "event_name",
        "event_location",
        "industry_interest",
        "investment_budget",
        "business_experience",
        "status",
        "get_source_display",
        "get_api_source_display",
        "created_at",
    )
    readonly_fields = ("created_at", "updated_at", "source_platform", "api_source")
    list_filter = ("status", "industry_interest", "source_platform")
    search_fields = ("first_name", "last_name", "email_address", "company_name")

    def get_source_display(self, obj):
        s = (obj.source_platform or "").lower()
        if "nfis" in s: return "NFIS"
        if "igtf" in s: return "IGTF"
        return s.upper()
    get_source_display.short_description = "Source"

    def get_api_source_display(self, obj):
        s = (obj.api_source or "").lower()
        if "nfis" in s: return "NFIS"
        if "igtf" in s: return "IGTF"
        return s.upper() if s else "-"
    get_api_source_display.short_description = "API Source"


# ===============================
# INVESTOR REGISTRATION
# ===============================
@admin.register(InvestorRegistration)
class InvestorRegistrationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "firm_name",
        "email",
        "phone_number",
        "investment_budget",
        "interested_sector",
        "status",
        "get_source_display",
        "created_at",
    )
    readonly_fields = ("created_at", "updated_at", "source_platform")
    list_filter = ("status", "source_platform", "interested_sector")
    search_fields = ("full_name", "email", "phone_number")

    def get_source_display(self, obj):
        s = (obj.source_platform or "").lower()
        if "nfis" in s: return "NFIS"
        if "igtf" in s: return "IGTF"
        return s.upper()
    get_source_display.short_description = "Source"


# ===============================
# CATEGORY
# ===============================
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    readonly_fields = ("created_at",)
    search_fields = ("name",)


# ===============================
# EVENT
# ===============================
class SectorInline(admin.TabularInline):
    model = Sector
    extra = 1

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    inlines = [SectorInline]
    list_display = (
        "id",
        "title",
        "location",
        "start_date",
        "end_date",
        "is_active",
        "has_stall_layout",
        "created_at",
    )
    readonly_fields = ("created_at",)
    list_filter = ("is_active", "start_date")
    search_fields = ("title", "location")


# ===============================
# GALLERY IMAGE
# ===============================
@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ("id", "page", "section", "display_order", "created_at")
    list_filter = ("page", "section")
    ordering = ("page", "section", "display_order")

# ===============================
# CONTACT INQUIRY
# ===============================
@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "type_tag",
        "target_name",
        "email",
        "phone_number",
        "status_tag",
        "created_at",
    )
    list_filter = ("inquiry_type", "status", "source_platform")
    search_fields = ("full_name", "email", "phone_number", "target_name")
    readonly_fields = ("created_at", "source_platform")

    def type_tag(self, obj):
        colors = {
            'franchise': '#3b82f6', # Blue
            'investor': '#8b5cf6',  # Purple
            'general': '#6b7280',   # Gray
        }
        color = colors.get(obj.inquiry_type, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase;">{}</span>',
            color,
            obj.get_inquiry_type_display()
        )
    type_tag.short_description = "Inquiry Type"

    def status_tag(self, obj):
        colors = {
            'pending': '#f59e0b',   # Amber
            'contacted': '#10b981', # Emerald
            'rejected': '#ef4444',  # Red
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="color: {}; font-weight: bold; display: flex; align-items: center; gap: 5px;">'
            '<span style="width: 8px; height: 8px; background-color: {}; border-radius: 50%;"></span> {}</span>',
            color, color, obj.get_status_display()
        )
    status_tag.short_description = "Status"

@admin.register(FranchiseInquiry)
class FranchiseInquiryAdmin(ContactInquiryAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(inquiry_type='franchise')

@admin.register(InvestorInquiry)
class InvestorInquiryAdmin(ContactInquiryAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(inquiry_type='investor')


# ===============================
# SECTOR
# ===============================
@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "event", "created_at")
    list_filter = ("event",)
    search_fields = ("name", "event__title")
    readonly_fields = ("created_at", "updated_at")
