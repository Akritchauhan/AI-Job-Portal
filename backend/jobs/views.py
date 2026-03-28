from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Job
from .serializers import JobSerializer

# ✅ POST Job (Recruiter)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_job(request):
    data = request.data.copy()
    data['posted_by'] = request.user.id

    serializer = JobSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ GET Jobs (Student)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_jobs(request):
    jobs = Job.objects.all()
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)