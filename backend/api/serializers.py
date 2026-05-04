from rest_framework import serializers
from .models import (
    ExhibitorRegistration,
    VisitorRegistration,
    Category,
    Event,
    GalleryImage,
    User,
    SystemSettings,
    InvestorRegistration,
    ContactInquiry,
    Sector,
    FranchisorRegistration,
)

# =====================================================
# EXHIBITOR SERIALIZER (Matches NEW Model)
# =====================================================
class ExhibitorRegistrationSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExhibitorRegistration
        fields = [
            "id",
            "user",
            "logo",
            "status",
            "event_location",
            "company_name",
            "contact_person_name",
            "designation",
            "email_address",
            "contact_number",
            "product_category",
            "stall_number",
            "event_name",
            "company_address",
            "source_platform",
            "api_source",
            "is_email_verified",
            "is_phone_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Return full data for authenticated users (admin, staff, franchisor, investor)
        if request and request.user and request.user.is_authenticated:
            return data
            
        # Restrict fields for unauthenticated users
        public_fields = [
            "id", "logo", "status", "company_name", "product_category",
            "stall_number", "event_name",
            "is_email_verified", "is_phone_verified"
        ]
        return {field: data[field] for field in public_fields if field in data}

    # field validation
    def validate_email_address(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required")
        return value.lower()

    def validate_contact_number(self, value):
        if not value:
            raise serializers.ValidationError("Contact number is required")

        cleaned = "".join(filter(str.isdigit, value))
        if len(cleaned) < 10:
            raise serializers.ValidationError("Contact number must be at least 10 digits")

        return value


# =====================================================
# FRANCHISOR SERIALIZER
# =====================================================
class FranchisorRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FranchisorRegistration
        fields = [
            "id",
            "user",
            "logo",
            "status",
            "company_name",
            "contact_person_name",
            "designation",
            "email_address",
            "contact_number",
            "industry",
            "product_category",
            "founded_year",
            "units_operating",
            "investment_required",
            "roi",
            "about",
            "franchise_fee",
            "royalty",
            "space_requirement",
            "location_type",
            "break_even",
            "cities",
            "training_support",
            "setup_support",
            "marketing_support",
            "company_address",
            "event_location",
            "event_name",
            "source_platform",
            "api_source",
            "is_email_verified",
            "is_phone_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        # Return full data for authenticated users
        if request and request.user and request.user.is_authenticated:
            return data

        # Restrict fields for unauthenticated users
        public_fields = [
            "id", "logo", "status", "company_name",
            "industry", "product_category", "founded_year", "units_operating",
            "investment_required", "roi", "about", 
            "franchise_fee", "royalty", "space_requirement", "location_type", 
            "break_even", "cities", "training_support", "setup_support", "marketing_support",
            "is_email_verified", "is_phone_verified"
        ]
        return {field: data[field] for field in public_fields if field in data}

    def validate_email_address(self, value):
        if not value:
            return value
        return value.lower()

    def validate_contact_number(self, value):
        if not value:
            return value

        cleaned = "".join(filter(str.isdigit, value))
        if len(cleaned) < 10:
            raise serializers.ValidationError("Contact number must be at least 10 digits")

        return value

# =====================================================
# VISITOR SERIALIZER (Matches NEW Model)
# =====================================================
class VisitorRegistrationSerializer(serializers.ModelSerializer):

    class Meta:
        model = VisitorRegistration
        fields = [
            "id",
            "event_location",
            "event_name",
            "first_name",
            "last_name",
            "company_name",
            "email_address",
            "phone_number",
            "industry_interest",
            "franchisor_interest",
            "investment_budget",
            "business_experience",
            "status",
            "source_platform",
            "api_source",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_email_address(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required")
        return value.lower()

    def validate_phone_number(self, value):
        if not value:
            raise serializers.ValidationError("Phone number is required")

        cleaned = "".join(filter(str.isdigit, value))
        if len(cleaned) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits")

        return value


# =====================================================
# INVESTOR SERIALIZER
# =====================================================
class InvestorRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestorRegistration
        fields = [
            "id",
            "user",
            "logo",
            "full_name",
            "firm_name",
            "email",
            "phone_number",
            "investment_budget",
            "interested_sector",
            "preferred_location",
            "business_experience",
            "companies_financed",
            "about",
            "status",
            "source_platform",
            "is_email_verified",
            "is_phone_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "user", "created_at", "updated_at")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        # Return full data for authenticated users
        if request and request.user and request.user.is_authenticated:
            return data

        # Restrict fields for unauthenticated users
        public_fields = [
            "id", "logo", "full_name", "firm_name",
            "investment_budget", "interested_sector", "preferred_location",
            "business_experience", "companies_financed", "about", "status",
            "is_email_verified", "is_phone_verified"
        ]
        return {field: data[field] for field in public_fields if field in data}

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required")
        return value.lower()

    def validate_phone_number(self, value):
        if not value:
            raise serializers.ValidationError("Phone number is required")

        cleaned = "".join(filter(str.isdigit, value))
        if len(cleaned) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits")

        return value


# =====================================================
# CATEGORY SERIALIZER
# =====================================================
class CategorySerializer(serializers.ModelSerializer):
    image = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Category
        fields = "__all__"


# =====================================================
# SECTOR SERIALIZER
# =====================================================
class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = [
            "id",
            "name",
            "description",
            "created_at",
            "updated_at",
        ]


# =====================================================
# EVENT SERIALIZER
# =====================================================
class EventSerializer(serializers.ModelSerializer):
    sectors = SectorSerializer(many=True, required=False)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "location",
            "venue",
            "start_date",
            "end_date",
            "time_schedule",
            "exhibitors_count",
            "buyers_count",
            "countries_count",
            "sectors_count",
            "is_active",
            "opt_out_date",
            "has_stall_layout",
            "image",
            "description",
            "sectors",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        sectors_data = validated_data.pop('sectors', [])
        event = Event.objects.create(**validated_data)
        # Create related sectors
        for sector_data in sectors_data:
            Sector.objects.create(event=event, **sector_data)
        return event

    def update(self, instance, validated_data):
        sectors_data = validated_data.pop('sectors', None)
        
        # Standard fields update
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update nested sectors ONLY if sectors key was present in request
        if sectors_data is not None:
            # Clear existing sectors and replace with new ones
            instance.sectors.all().delete()
            for sector_data in sectors_data:
                Sector.objects.create(event=instance, **sector_data)
        
        return instance


# =====================================================
# GALLERY SERIALIZER
# =====================================================
class GalleryImageSerializer(serializers.ModelSerializer):
    # Accept a string (we will pass S3 URL)
    image = serializers.CharField()

    class Meta:
        model = GalleryImage
        fields = "__all__"

    def validate_image(self, value):
        # Accept only S3 URL after upload
        if not value.startswith("http"):
            raise serializers.ValidationError("Image must be a valid URL.")
        return value

# =====================================================
# USER SERIALIZER
# =====================================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "is_password_set",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "is_active",
            "is_password_set",
            "date_joined",
        ]


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ["under_maintenance", "date_of_online"]

# =====================================================
# CONTACT INQUIRY SERIALIZER
# =====================================================
class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = "__all__"

    def validate_full_name(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Full name is required")
        return value

    def validate_email(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Email is required")
        if "@" not in value or "." not in value:
            raise serializers.ValidationError("Invalid email format")
        return value.lower()

    def validate_phone_number(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Phone number is required")
        return value

    def validate_message(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Message is required")
        return value
