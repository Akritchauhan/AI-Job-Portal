from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import RegisterSerializer
from .email_service import send_welcome_email
from .models import User
import logging

logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer that includes user role in JWT response"""
    
    def get_token(self, user):
        token = super().get_token(user)
        # Add custom claims to token
        token['role'] = user.role
        token['username'] = user.username
        token['email'] = user.email
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user role and details to response
        user = self.user
        data['role'] = user.role
        data['username'] = user.username
        data['email'] = user.email
        data['message'] = f"Login successful! Welcome {user.first_name or user.username}"
        
        logger.info(f"✅ User '{user.username}' (role: {user.role}) logged in successfully")
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that validates and returns user role"""
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            return Response({
                "msg": "User registered successfully!",
                "detail": "A welcome email has been sent to your registered email address.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({
                "error": f"Registration failed: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def test_email(request):
    """Test endpoint to send a test email"""
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create a test user object (not saved to database)
        test_user = User(
            username='test_user',
            email=email,
            first_name='Test',
            role='student'
        )
        result = send_welcome_email(test_user)
        if result:
            return Response({
                "success": True,
                "msg": "Test email sent successfully!",
                "email": email,
                "note": "If email backend is CONSOLE, check your terminal/console output."
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "success": False,
                "msg": "Failed to send test email. Check logs for details."
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Test email error: {str(e)}")
        return Response({
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)