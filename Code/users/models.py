from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, JsonResponse
import hashlib
import secrets
from datetime import timedelta

# Create a UserProfile model to store additional user information
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar_color = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


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
    folder_id = models.AutoField(primary_key=True)
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
    file_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    path = models.CharField(max_length=512)
    size = models.PositiveIntegerField() #File size in bytes
    file_type = models.CharField(max_length=50)
    date_created = models.DateTimeField(auto_now_add=True)
    folder_id = models.ForeignKey(Folder, on_delete=models.CASCADE)

    def __str__(self):
        return f"File: {self.name} ({self.size} bytes, {self.file_type})"

class InviteKeys(models.Model):
    key = models.CharField(primary_key=True, max_length=64)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)

    # validate a key
    def validateKey(self, key):
        invite_key = self.objects.filter(key = key).first()
        if not invite_key:
            raise ValueError('Invalid key provided.')
        
        if timezone.now() > invite_key.date_created + timedelta(hours=24):
            InviteKeys.objects.filter(key = key).delete()
            raise ValueError('Key has expired (more than 24 hours since the invite was sent)!')
                

    # joins the user to the project - only call after validateKey
    def useKey(self, key):
        invite_key = self.objects.filter(key = key).first()
        invite_key.project.user.add(invite_key.user)
        InviteKeys.objects.filter(key = key).delete()


    # create a new key for a user and a project
    def createKey(self, user, project):
        key = secrets.token_hex(32)
        InviteKeys.objects.create(
            key = key,
            user = user,
            project = project,
        ).save()
        return key
    

    # send an email for a key, if the key is valid. Just return if key is invalid
    def sendEmail(self, request, key):
        invite_link = request.build_absolute_uri(f'/api/post/join_project/?key={key}')
        invite_key = self.objects.filter(key=key).first()
        if not invite_key:
            print("Invalid key attempting to send email.")
            return
        project = invite_key.project.name
        email = invite_key.user.email
        send_mail(
            "MyCloudFTS: Project Invite!", 
            f"You have been invited to {project}! Click the link to join: {invite_link}.",
            "no-reply@MyCloudFTS.com", 
            [email],
            html_message=f"You have been invited to <b>{project}</b>! Click <a href='{invite_link}'>here</a> to join!"
        )

class Auth2FA(models.Model):
    key = models.PositiveIntegerField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)

    def create_2fa_key(self, user):
        # if user has a key, delete it
        previous_keys = self.objects.filter(user=user).all()
        if previous_keys:
            previous_keys.delete()
        key = secrets.randbelow(900000) + 100000
        self.objects.create(
            key=key,
            user=user
        )
        return key
    
    def send_2fa_email(self, key):
        key_2fa = self.objects.filter(key=key).first()
        if not key_2fa:
            print("Invalid key attempting to send email.")
            return
        email = key_2fa.user.email
        key = key_2fa.key
        send_mail(
            "MyCloudFTS: 2FA Key", 
            f"Your 2fa key is: {key}",
            "no-reply@MyCloudFTS.com", 
            [email],
            html_message=f"Your 2fa key is: {key}"
        )

    # Returns true if valid key, false otherwise
    def use_2fa_key(self, user, key):
        key_2fa = self.objects.filter(key=key, user=user).first()
        if not key_2fa:
            return False
        key_2fa.delete()
        return timezone.now() < key_2fa.date_created + timedelta(minutes=15)

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    use_auth2fa = models.BooleanField(default=False)

    def get_or_create(self, user):
        settings = self.objects.filter(user=user).first()
        if not settings:
            settings = self.objects.create(user=user)
        return settings
    
    def toggle_2fa(self):
        self.use_auth2fa = not self.use_auth2fa
        self.save()
        
# Add methods to User model using a proxy pattern
def get_initials(self):
    """Return the user's initials (first letter of first and last name)"""
    initials = ""
    if self.first_name:
        initials += self.first_name[0].upper()
    if self.last_name:
        initials += self.last_name[0].upper()
    if not initials and self.username:
        initials = self.username[0].upper()
    if not initials:
        initials = "U"  # Default if no name data is available
    return initials[:2]  # Limit to 2 characters

def get_avatar_color(self):
    """Get user's preferred avatar color or generate a default one"""
    # First check if the user has a profile with a custom color
    try:
        if hasattr(self, 'profile') and self.profile.avatar_color:
            return self.profile.avatar_color
    except UserProfile.DoesNotExist:
        pass
    
    # If no custom color, use the default generated color
    # Define a palette of attractive colors
    colors = [
        'hsl(210, 100%, 56%)',  # Blue
        'hsl(340, 82%, 52%)',   # Pink
        'hsl(160, 84%, 39%)',   # Green
        'hsl(276, 91%, 38%)',   # Purple
        'hsl(16, 94%, 54%)',    # Orange
        'hsl(188, 78%, 41%)'    # Teal
    ]
    
    # Use a hash of the username to get a consistent color
    seed = self.username or self.email or str(self.id)
    hash_object = hashlib.md5(seed.encode())
    hash_hex = hash_object.hexdigest()
    
    # Use the first two characters of the hash to select a color
    color_index = int(hash_hex[:4], 16) % len(colors)
    return colors[color_index]

def set_avatar_color(self, color):
    """Set user's preferred avatar color"""
    # Get or create user profile
    profile, created = UserProfile.objects.get_or_create(user=self)
    profile.avatar_color = color
    profile.save()

def get_avatar_data(self):
    """Return avatar data with initials and background color"""
    return {
        'initials': self.get_initials(),
        'color': self.get_avatar_color(),
    }

# Add these methods to the User model
User.get_initials = get_initials
User.get_avatar_color = get_avatar_color
User.set_avatar_color = set_avatar_color
User.get_avatar_data = get_avatar_data

