from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Application, Job
from .serializers import ApplicationSerializer, JobSerializer

# ✅ POST Job (Recruiter)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_job(request):
    
    # 🔒 Restrict to recruiter
    if request.user.role != 'recruiter':
        return Response({"error": "Only recruiters can post jobs"}, status=403)

    data = request.data.copy()
    data['posted_by'] = request.user.id

    serializer = JobSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# ✅ GET Jobs (Student)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_jobs(request):
    jobs = Job.objects.all()
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_job(request):
    
    # 🔒 Only student can apply
    if request.user.role != 'student':
        return Response({"error": "Only students can apply"}, status=403)

    data = request.data.copy()
    data['student'] = request.user.id

    serializer = ApplicationSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    if request.user.role != 'student':
        return Response({"error": "Only students can view their applications"}, status=403)
    
    applications = Application.objects.filter(student=request.user)
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicants(request, job_id):
    if request.user.role != 'recruiter':
        return Response({"error": "Only recruiters can view applicants"}, status=403)
    
    try:
        job = Job.objects.get(id=job_id, posted_by=request.user)
    except Job.DoesNotExist:
        return Response({"error": "Job not found or not yours"}, status=404)
    
    applications = Application.objects.filter(job=job)
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)