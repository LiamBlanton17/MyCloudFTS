from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import hashlib


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

