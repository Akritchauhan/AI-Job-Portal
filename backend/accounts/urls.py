from django.urls import path
from .views import register, test_email, CustomTokenObtainPairView

urlpatterns = [
    path('register/', register),
    path('login/', CustomTokenObtainPairView.as_view()),
    path('test-email/', test_email),
]