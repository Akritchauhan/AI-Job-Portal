from django.urls import path
from .views import applicants, my_jobs, post_job, get_jobs, apply_job, my_applications, update_status
from rest_framework.decorators import api_view, permission_classes  

urlpatterns = [
    path('', get_jobs),
    path('post/', post_job),
    path('apply/<int:job_id>/', apply_job),
    path('my-applications/', my_applications),
    path('applicants/<int:job_id>/', applicants),
    path('update-status/<int:app_id>/', update_status),
    path('my-jobs/', my_jobs),
]