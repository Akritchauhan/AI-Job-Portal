from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Job(models.Model):
    company_name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    description = models.TextField()
    deadline = models.DateField()
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.role
    
    
class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    resume = models.FileField(upload_to='resumes/')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    match_score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.student} - {self.job}"