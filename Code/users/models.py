from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    project_id = models.AutoField(primary_key=True)
    root_path = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    user = models.ManyToManyField(User, related_name="projects")

    def __str__(self):
        return self.name


class Folder(models.Model):
    folder_id = models.AutoField(primary_key=True, default=0)
    name = models.CharField(max_length=255)
    path = models.CharField(max_length=512)
    parent_folder = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfolders')
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    is_root = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Folder: {self.name} ({self.path})"

    class Meta:
        verbose_name = 'Folder'
        verbose_name_plural = 'Folders'


class File(models.Model):
    file_id = models.AutoField(primary_key=True, default=0)
    name = models.CharField(max_length=255)
    path = models.CharField(max_length=512)
    size = models.PositiveIntegerField() #File size in bytes
    file_type = models.CharField(max_length=50)
    date_created = models.DateTimeField(auto_now_add=True)
    folder_id = models.ForeignKey(Folder, on_delete=models.CASCADE)

    def __str__(self):
        return f"File: {self.name} ({self.size} bytes, {self.file_type})"
