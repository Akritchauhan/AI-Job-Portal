from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Application, Job
from .serializers import ApplicationSerializer, JobSerializer
from .utils import extract_text_from_pdf, calculate_match_score
from .utils import recommend_jobs
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_job(request):

    if request.user.role != 'recruiter':
        return Response({"error": "Only recruiters can post jobs"}, status=403)

    serializer = JobSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(posted_by=request.user)
        return Response(serializer.data, status=201)

    return Response({"error": serializer.errors}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_jobs(request):
    jobs = Job.objects.all()
    # 🔍 Filters
    company = request.GET.get('company')
    role = request.GET.get('role')
    search = request.GET.get('search')

    if company:
        jobs = jobs.filter(company_name__icontains=company)

    if role:
        jobs = jobs.filter(role__icontains=role)

    if search:
        jobs = jobs.filter(description__icontains=search)

    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    if request.user.role != 'student':
        return Response({"error": "Only students allowed"}, status=403)
    
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

    # 🔥 Order by AI score (highest first)
    applications = Application.objects.filter(job=job).order_by('-match_score')
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['PATCH', 'PUT'])
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

    # Allow all valid statuses
    valid_statuses = ['pending', 'in_review', 'shortlisted', 'rejected', 'hired']
    
    if new_status not in valid_statuses:
        return Response({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}, status=400)

    application.status = new_status
    application.save()

    return Response({"message": "Status updated", "status": new_status})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_job(request, job_id):
    logger.info(f"🔥 Student {request.user.username} applying for job {job_id}")
    
    if request.user.role != 'student':
        return Response({"error": "Only students can apply"}, status=403)

    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)

    resume_file = request.FILES.get('resume')

    if not resume_file:
        logger.warning(f"⚠️ No resume file provided by {request.user.username}")
        return Response({"error": "Resume required"}, status=400)

    logger.info(f"📄 Resume file received: {resume_file.name} ({resume_file.size} bytes)")

    # 🔥 Extract text + calculate score
    resume_text = extract_text_from_pdf(resume_file)
    
    if not resume_text:
        logger.error(f"❌ Failed to extract text from resume: {resume_file.name}")
        return Response({
            "error": "Could not read resume. Please upload a valid PDF file.",
            "match_score": 0
        }, status=400)
    
    logger.info(f"📝 Job description length: {len(job.description)} chars")
    score = calculate_match_score(resume_text, job.description)
    
    logger.info(f"✅ Final score: {score}%")

    application = Application.objects.create(
        student=request.user,
        job=job,
        resume=resume_file,
        match_score=score
    )

    return Response({
        "message": "Applied successfully",
        "match_score": score,
        "detail": f"Your resume matched {score}% with the job requirements"
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_jobs(request):
    if request.user.role != 'recruiter':
        return Response({"error": "Only recruiters allowed"}, status=403)

    jobs = Job.objects.filter(posted_by=request.user)
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_recruiter_applicants(request):
    """Get all applicants across all jobs posted by the recruiter"""
    if request.user.role != 'recruiter':
        return Response({"error": "Only recruiters allowed"}, status=403)

    # Get all jobs posted by this recruiter
    recruiter_jobs = Job.objects.filter(posted_by=request.user)
    
    # Get all applications for these jobs, ordered by score
    applications = Application.objects.filter(job__in=recruiter_jobs).order_by('-match_score')
    
    # Apply optional filters
    status = request.GET.get('status')
    job_id = request.GET.get('job_id')
    min_score = request.GET.get('min_score')
    
    if status:
        applications = applications.filter(status=status)
    
    if job_id:
        applications = applications.filter(job_id=job_id)
    
    if min_score:
        try:
            min_score = float(min_score)
            applications = applications.filter(match_score__gte=min_score)
        except (ValueError, TypeError):
            pass
    
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)