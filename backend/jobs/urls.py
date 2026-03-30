from django.urls import path
from .views import applicants, post_job, get_jobs, apply_job,my_applications, recommend_jobs_api, update_status
from rest_framework.decorators import api_view, permission_classes  

urlpatterns = [
    path('', get_jobs),
    path('post/', post_job),
    path('apply/', apply_job),
    path('my-applications/', my_applications),
    path('applicants/<int:job_id>/', applicants),
    path('recommend/', recommend_jobs_api),
    path('update-status/<int:app_id>/', update_status),
    path('apply/<int:job_id>/', apply_job),
    path('my-applications/', my_applications),
]