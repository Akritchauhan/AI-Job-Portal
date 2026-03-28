from django.urls import path
from .views import post_job, get_jobs, apply_job

urlpatterns = [
    path('', get_jobs),
    path('post/', post_job),
    path('apply/', apply_job),
]