from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Job(models.Model):
    company_name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    description = models.TextField()
    skills_required = models.TextField(blank=True, null=True, help_text="Comma-separated list of required skills")
    deadline = models.DateField(blank=True, null=True)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.role

    class Meta:
        ordering = ['-created_at']
    
    
class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_review', 'In Review'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    resume = models.FileField(upload_to='resumes/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    match_score = models.FloatField(null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.student} - {self.job}"

    class Meta:
        ordering = ['-applied_at']