from django.urls import path
from .views import register, test_email
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', register),
    path('login/', TokenObtainPairView.as_view()),
    path('test-email/', test_email),
]