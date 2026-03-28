from django.urls import path
from .views import applicants, post_job, get_jobs, apply_job,my_applications
from rest_framework.decorators import api_view, permission_classes  

urlpatterns = [
    path('', get_jobs),
    path('post/', post_job),
    path('apply/', apply_job),
    path('my-applications/', my_applications),
    path('applicants/<int:job_id>/', applicants),
]