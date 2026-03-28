from django.urls import path
from .views import post_job, get_jobs

urlpatterns = [
    path('', get_jobs),
    path('post/', post_job),
]