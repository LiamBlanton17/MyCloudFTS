from django import forms
from users.models import File, Folder, Project, UserProject

#Might not need this forms.py file if we are not using Django forms to create or update models
class FileForm(forms.ModelForm):
    class Meta:
        model = File
        fields = ['name', 'path', 'size', 'file_type']