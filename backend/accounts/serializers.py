from rest_framework import serializers
from .models import User
from .email_service import send_welcome_email


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate_email(self, value):
        """Validate that email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def validate_username(self, value):
        """Validate that username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
    def create(self, validated_data):
        """Create user and send welcome email"""
        user = User.objects.create_user(**validated_data)
        # Send welcome email to the new user
        send_welcome_email(user)
        return user