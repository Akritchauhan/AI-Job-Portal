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