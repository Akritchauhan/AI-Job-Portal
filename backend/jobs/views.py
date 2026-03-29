from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Application, Job
from .serializers import ApplicationSerializer, JobSerializer
from .utils import extract_text_from_pdf, calculate_match_score
from .utils import recommend_jobs
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_job(request):

    if request.user.role != 'student':
        return Response({"error": "Only students can apply"}, status=403)

    data = request.data.copy()
    data['student'] = request.user.id

    serializer = ApplicationSerializer(data=data)
    
    if serializer.is_valid():
        application = serializer.save()

        # 🔹 AI Logic
        resume_file = application.resume
        resume_text = extract_text_from_pdf(resume_file)

        job_description = application.job.description

        score = calculate_match_score(resume_text, job_description)

        application.match_score = score
        application.save()

        return Response({
            "message": "Applied successfully",
            "match_score": score
        })

    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recommend_jobs_api(request):

    if request.user.role != 'student':
        return Response({"error": "Only students can get recommendations"}, status=403)

    resume_file = request.FILES.get('resume')

    if not resume_file:
        return Response({"error": "Resume required"}, status=400)

    resume_text = extract_text_from_pdf(resume_file)

    jobs = Job.objects.all()

    recommendations = recommend_jobs(resume_text, jobs)

    return Response(recommendations)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applicants(request, job_id):

    if request.user.role != 'recruiter':
        return Response({"error": "Only recruiters can view applicants"}, status=403)

    try:
        job = Job.objects.get(id=job_id, posted_by=request.user)
    except Job.DoesNotExist:
        return Response({"error": "Job not found or not yours"}, status=404)

    # 🔥 Order by AI score (highest first)
    applications = Application.objects.filter(job=job).order_by('-match_score')

    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_status(request, app_id):

    if request.user.role != 'recruiter':
        return Response({"error": "Only recruiters can update status"}, status=403)

    try:
        application = Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        return Response({"error": "Application not found"}, status=404)

    # 🔒 Ensure recruiter owns the job
    if application.job.posted_by != request.user:
        return Response({"error": "Not authorized"}, status=403)

    new_status = request.data.get('status')

    if new_status not in ['selected', 'rejected']:
        return Response({"error": "Invalid status"}, status=400)

    application.status = new_status
    application.save()

    return Response({"message": "Status updated", "status": new_status})