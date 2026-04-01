from rest_framework import serializers
from .models import Job, Application
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class JobSerializer(serializers.ModelSerializer):
    posted_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'company_name', 'role', 'description', 'skills_required', 'deadline', 'posted_by', 'created_at', 'updated_at']

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True, required=False)
    student = UserSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Application
        fields = ['id', 'student', 'student_id', 'job', 'job_id', 'resume', 'status', 'match_score', 'applied_at']
    
    def create(self, validated_data):
        job_id = validated_data.pop('job_id', None)
        student_id = validated_data.pop('student_id', None)
        if job_id:
            validated_data['job_id'] = job_id
        if student_id:
            validated_data['student_id'] = student_id
        return super().create(validated_data)