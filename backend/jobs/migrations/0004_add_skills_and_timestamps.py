# Generated migration for adding skills_required and timestamps

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0003_application_match_score'),
    ]

    operations = [
        # Add skills_required to Job model
        migrations.AddField(
            model_name='job',
            name='skills_required',
            field=models.TextField(blank=True, null=True, help_text="Comma-separated list of required skills"),
        ),
        # Add created_at to Job model
        migrations.AddField(
            model_name='job',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        # Add updated_at to Job model
        migrations.AddField(
            model_name='job',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        # Add applied_at to Application model
        migrations.AddField(
            model_name='application',
            name='applied_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        # Alter status field to accept new status options
        migrations.AlterField(
            model_name='application',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('in_review', 'In Review'),
                    ('shortlisted', 'Shortlisted'),
                    ('rejected', 'Rejected'),
                    ('hired', 'Hired'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
