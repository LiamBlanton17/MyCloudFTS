from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, JsonResponse
from django.db import connection
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model, authenticate, login, logout
from users.models import Project, Folder, File, InviteKeys, Auth2FA, UserSettings
import json
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from users.functions import get_file_download
from django.core.mail import send_mail
from django.core.mail import send_mail as confirm_send_mail
import os
from django.utils import timezone


# get rid of this LOL vvvvv
from django.views.decorators.csrf import csrf_exempt


User = get_user_model()  # Get Django's built-in User model


def profile(request, username):
    user = User.objects.get(username=username)
    return render(request, 'profile.html', {'user': user})


@login_required(login_url='/login.html')
def profile(request):
    return render(request, 'profile.html', {'user': request.user})


@login_required(login_url='/login.html')
def dashboard(request):
    # The login_required decorator already ensures the user is authenticated
    try:
        # Try to fetch projects or handle potential errors
        projects = list(request.user.projects.all().order_by('-date_created'))
        # Converting to list ensures the query is executed and any errors appear here
        return render(request, 'userdash.html', {'user': request.user, 'projects': projects})
    except Exception as e:
        # Log the error and provide a fallback
        print(f"Error fetching projects: {str(e)}")
        # Return an empty list of projects as fallback
        return render(request, 'userdash.html', {'user': request.user, 'projects': []})


@login_required(login_url='/login.html')
def userproject(request):
    if not request.user.is_authenticated:
        return redirect('login')
    project_id = int(request.GET.get('project_id', -1))
    folder_id = int(request.GET.get('folder_id', -1))
    if project_id == -1:  # Must have a project id
        return redirect('dashboard')
    if not Project.objects.filter(project_id=project_id).exists():  # Project must exists
        return redirect('dashboard')
    if not Project.objects.filter(project_id=project_id, user=request.user).exists():  # User must own/have access to the project
        return redirect('dashboard')
    folder = None
    if folder_id == -1:  # Get root folder
        folder = Folder.objects.filter(project_id=project_id, is_root=True).first()
    else:  # Get this specific folder
        folder = Folder.objects.filter(folder_id=folder_id).first()
    if folder:
        sub_folders = Folder.objects.filter(parent_folder=folder).all()
        files = File.objects.filter(folder_id=folder.folder_id).all()
    else:
        sub_folders = []
        files = []
    return render(request, 'userproject.html', {'sub_folders': sub_folders, 'files': files})


def home(request):
    return render(request, 'login.html')


def landing_page(request):
    return render(request, 'landingpage.html')


def signup(request):
    return render(request, 'signup.html')


def pricing(request):
    return render(request, 'pricing.html')


def confirmation(request):
    return render(request, 'confirmation.html')


def api_sign_up(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'})

    try:
        data = json.loads(request.body)
        first_name = data.get('first_name', None)
        last_name = data.get('last_name', None)
        email = data.get('email', None)
        password = data.get('password', None)

        if not all([first_name, last_name, email, password]):
            return JsonResponse({'message': 'All fields are required!'})

        # Confirm unique email
        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already in use!'})

        # Create and save user securely
        user = User.objects.create_user(
            username=email,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password
        )

        # Login user on signup
        login(request, user)
        print(f"User {email} successfully logged in")  # Debug log

        return JsonResponse({
            'message': f'Hello, {first_name}! Your account has been created!',
            'status': 'success',
            'redirect': '/dashboard.html'
        })

    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'})


def api_login(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method', 'status': 'error'})

    try:
        data = json.loads(request.body)
        email = data.get('email', None)
        password = data.get('password', None)

        if not email or not password:
            return JsonResponse({
                'message': 'Email and password are required!',
                'status': 'error'
            })

        user = authenticate(username=email, password=password)

        if user is not None:  
            # Instead of logging in, create a 2fa code, send an email, and prompt user  
            settings = UserSettings.get_or_create(self=UserSettings, user=user) 
            if settings.use_auth2fa:
                key = Auth2FA.create_2fa_key(self=Auth2FA, user=user)  
                Auth2FA.send_2fa_email(self=Auth2FA, key=key)
                return JsonResponse({
                'message': f'Requesting 2fa key.',
                'status': 'success',
            })
            login(request, user)
            return JsonResponse({
                'message': f'Login success',
                'status': 'login',
            })
        else:
            print(f"Failed login attempt for {email}")  # Debug log
            return JsonResponse({
                'message': 'Invalid email or password!',
                'status': 'error'
            })

    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        return JsonResponse({
            'message': f'Error! {str(e)}',
            'status': 'error'
        })

@login_required(login_url='/login.html')
def toggle_2fa(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    try:
        user = request.user
        
        # Gets the user settings. Creates if it does not exist yet
        settings = UserSettings.get_or_create(self=UserSettings, user=user)

        # Toggle the 2FA
        settings.toggle_2fa()

        return JsonResponse({
            'message': 'Your information has been updated successfully!',
            'status': 'success',
            'auth2fa_status': settings.use_auth2fa
        })

    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'}, status=500)
        

def validate_2fa(request):
    try:
        data = json.loads(request.body)
        email = data.get('email', None)
        password = data.get('password', None)
        key = data.get('key_2fa', None)
        user = authenticate(username=email, password=password)

        if user is not None:  
            if Auth2FA.use_2fa_key(self=Auth2FA, user=user, key=key):
                login(request, user)
                return JsonResponse({
                    'message': f'2fa key was verified',
                    'status': 'success',
                })
            return JsonResponse({
                'message': f'Invalid 2fa key! Please try again!',
                'status': 'error',
            })
        else:
            print(f"Failed login attempt for {email}")  # Debug log
            return JsonResponse({
                'message': 'Invalid email or password!',
                'status': 'error'
            })
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        return JsonResponse({
            'message': f'Error! {str(e)}',
            'status': 'error'
        })

@require_POST
def api_logout(request):
    logout(request)
    return JsonResponse({'status': 'success'})

@login_required(login_url='/login.html')
def update_personal_info(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')

        if not all([first_name, last_name, email]):
            return JsonResponse({'message': 'All fields are required!'}, status=400)

        # Check if email is already in use by someone else
        if request.user.email != email and User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already in use!'}, status=409)

        # Update user info
        user = request.user
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.username = email
        user.save()

        return JsonResponse({
            'message': 'Your information has been updated successfully!',
            'status': 'success'
        })

    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'}, status=500)


# THIS DOES NOT WORK! Buggy front end, and backend doesn't work right
# The root folder path needs to be changed too. It will save files in the users directory
@login_required(login_url='/login.html')
def upload_file(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'},  status=405)

    try:
        project_id = int(request.GET.get('project_id', -1))
        folder_id = int(request.GET.get('folder_id', -1))

        if project_id == -1:  # Must have a project id
            return redirect('dashboard')

        # Save folder to variable
        folder = Folder.objects.filter(project_id=project_id, is_root=True).first() if folder_id == -1 \
            else Folder.objects.filter(folder_id=folder_id).first()
        
        if folder is None:
            return JsonResponse({'message': 'Invalid folder!'}, status=400)

        # uploaded_file = request.FILES['file']
        uploaded_files = request.FILES.getlist('files[]')
        if not uploaded_files:
            return JsonResponse({'message': 'No files uploaded!'})
        
        os.makedirs(folder.path, exist_ok=True)

        for uploaded_file in uploaded_files:
            file_name = uploaded_file.name
            file_path = os.path.join(folder.path, file_name)

            # Save to disk
            with open(file_path, "wb") as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)

            # Save to DB
            File.objects.create(
                name=file_name,
                path=file_path,
                size=uploaded_file.size,
                file_type=uploaded_file.content_type,
                folder_id=folder
            )

            print(f"Uploaded: {file_name} → {file_path}")

        return JsonResponse({'message': 'Upload successful!'})

        # file_name = uploaded_file.name
        # file_size = uploaded_file.size
        # file_type = uploaded_file.content_type

        # folder = None
        
        # if folder_id == -1:  # Get root folder
        #     folder = Folder.objects.filter(project_id=project_id, is_root=True).first()
        # else:  # Get this folder
        #     folder = Folder.objects.filter(folder_id=folder_id).first()

        # if folder is None:
        #     return JsonResponse({'message': 'Invalid folder!'})

        # Add file entry to database
        # file = File(
        #     name=file_name,
        #     path=f"{folder.path}{file_name}",
        #     size=file_size,
        #     file_type=file_type,
        #     folder_id=folder
        # )
        # file.save()
        # print(f"Uploaded: {file} to {folder.path}")

        # # Actually upload the file
        # save_path = f"{folder.path}{file_name}"  # Folder path has a trailing /
        # with open(save_path, "wb") as file:
        #     for chunk in uploaded_file.chunks():  # Read and write in chunks to handle large files
        #         file.write(chunk)
    
        # return JsonResponse({'message': f'Successfully uploaded file!'})
    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'})


@login_required(login_url='/login.html')
def create_project(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)

        # Extract fields from request
        project_name = data.get('projectName', None)
        project_description = data.get('projectDescription', None)

        username = request.user.username

        # Ensure user is authenticated
        if not username:
            return JsonResponse({'message': 'User not logged in!'})

        # Ensure all fields are provided
        if not project_name or not project_description:
            return JsonResponse({'message': 'Project name and description are required!'})

        # Prevent users from having duplicate project names
        if request.user.projects.filter(name=project_name).exists():
            return JsonResponse({'message': 'Project name already exists!'})

        # Create a new project
        new_project = Project(
            name=project_name,
            root_path=f'/media/user_uploads/{username}/{project_name}/',
            description=project_description,
        )
        new_project.save()
        new_project.user.set([request.user])

        # Create the folder for the project
        folder_path = os.path.dirname(os.path.realpath(__file__)) + f'/../user_uploads/{username}/{project_name}/root/'
        project_root_folder = Folder(
            name=f'{project_name} Root',
            path=folder_path,
            project=new_project,
            is_root=True
        )
        project_root_folder.save()
        os.makedirs(folder_path, exist_ok=True)

        # Add additional fields to project so page can load correct project_id
        return JsonResponse({
            'message': 'Project created successfully!',
            'project': {
                'id': new_project.project_id,
                'name': new_project.name,
                'description': new_project.description,
            }
        })
    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'})


# Delete a project and all its files and folders
@login_required(login_url='/login.html')
def delete_project(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'}, status = 405)

    try:
        data = json.loads(request.body)

        project_id = data.get('project_id', None) # Get project_id from request
        action = data.get('action', None) # Get action from request (delete)

        if not project_id or not action:
            return JsonResponse({'message': 'Invalid request data!'}, status = 400)
        
        if action != 'delete':
            return JsonResponse({'message': 'Invalid action!'}, status = 400)
        
        try:
            project_id = int(project_id)
        except ValueError:
            return JsonResponse({'message': 'Invalid project ID!'}, status = 400)
        
        project = Project.objects.filter(project_id=project_id).first()
        
        if not project:
            return JsonResponse({'message': 'Project does not exist!'}, status = 404)
        project.delete() # Delete the project from the database
        return JsonResponse({'message': f'Project {project_id} deleted successfully!'})

        # return JsonResponse({'message': f'Not implemented! Project ID that was going to be deleted: {project_id}'})
    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'})

# Delete a file from a project
@login_required(login_url='/login.html')
def delete_file(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'}, status=405)
    
    try: 
        data = json.loads(request.body)

        file_id = data.get('file_id', None) # Get file_id from request
        action = data.get('action', None) # Get action from request (delete)

        if not file_id or not action:
            return JsonResponse({'message': 'Invalid requets data!'}, status = 400)
        
        if action != 'delete':
            return JsonResponse({'message': 'Invalid action!'}, status = 400)
        
        try: 
            file_id = int(file_id)
        except ValueError:
            return JsonResponse({'message': 'Invalid file ID!'}, status=400)
        
        file = File.objects.filter(file_id=file_id).first()

        if not file:
            return JsonResponse({'message': 'File does not exist!'}, status=404)
        file.delete() # Delete the file from the database
        return JsonResponse({'message': f'File {file_id} deleted successfully!'})
    
    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'})


# View to download a file 
@login_required(login_url='/login.html')
def download_file(request):
    file_id = request.GET.get('file_id')
    response = get_file_download(file_id)
    return response


# View to download a project
@login_required(login_url='/login.html')
def download_project(request):
    pass
    

# View to invite a user to a project
@login_required(login_url='/login.html')
def invite_to_project(request):
    try:
        data = json.loads(request.body)
        project_id = data.get('project_id')
        email = data.get('email')
        
        if not project_id:
            raise ValueError('No project ID provided.')
        
        if not email:
            raise ValueError('No email to invite to was provided.')

        # Verify the email is a valid user
        invited_user = User.objects.filter(email=email).first()
        if not invited_user:
            raise ValueError('Email provided was not a valid user.')
        
        # Verify the project is a valid project owned by the user trying to share it
        project = Project.objects.filter(project_id=project_id, user=request.user).first()
        if not project:
            raise ValueError('Project ID provided is invalid or is not owned by user attempting to share it.')

        # Create a key that will allow the user to join the project, and return that key
        key = InviteKeys.createKey(self=InviteKeys, user=invited_user, project=project)

        # Send the email for this key
        InviteKeys.sendEmail(self=InviteKeys, request=request, key=key)

        return JsonResponse({'message': f'Successfully sent project invite!'}, status=200)
    except Exception as e:
        print(f'Error! {str(e)}')
        return JsonResponse({'message': f'Error! {str(e)}'}, status=400)
    

# View to join a project. Point to this logic from the link in the email from a project invite
def join_project(request):
    try:
        # Verify a key was given and that is was valid
        key = request.GET.get('key')
        if not key:
            raise ValueError('No key provided.')
        
        # Validate a key - raises errors otherwise
        InviteKeys.validateKey(self=InviteKeys, key=key)
        
        # Uses the key - joins the user to the project
        InviteKeys.useKey(self=InviteKeys, key=key)

        return JsonResponse({'message': f'Successfully joined the project!'}, status=200)
    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'}, status=400)


# view for renaming a project
@login_required(login_url='/login.html')
def rename_project(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)

        project_id = request.POST.get('project_id')
        new_name = request.POST.get('new_name')
        
        if not new_name or not project_id:
            return JsonResponse({'message': 'project name and/or new name required!'}, status=400)
        
        project = Project.objects.get(project_id = project_id)
        project.name = new_name
        project.save()
        return JsonResponse({'message': 'project was renamed!'}, status=200)

    except Exception as e:
        return JsonResponse({'message': 'project was not found!'}, status=404)


@login_required(login_url='/login.html')
def settings(request):
    user = request.user
    settings = UserSettings.get_or_create(self=UserSettings, user=user)
    return render(request, 'settings.html', {'user': user, 'auth2fa_status': settings.use_auth2fa})

# view for sending email confirmation to subscribers
@csrf_exempt
def confirmation_mail(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            userEmail = data.get('email')
            userName = data.get('firstname')
            userPlanName = data.get('plan_name')
            subject = 'MyCloudFTS Confirmation'
            message = f"Hello {userName}!,\n\nThank you for choosing MyCloudFTS! You have subscribed to our {userPlanName} tier. We hope you enjoy our service!"
            confirm_send_mail(subject, message, 'mycloudfts@gmail.com', [userEmail])
            return JsonResponse({'message': 'email was sent!'})
        except Exception as e:
            return JsonResponse({'message': 'email was not sent!'})
            

@login_required(login_url='/login.html')
def update_avatar_color(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        avatar_color = data.get('avatar_color')

        if not avatar_color:
            return JsonResponse({'message': 'Avatar color is required!'}, status=400)

        # Update user's avatar color preference using the new method
        user = request.user
        user.set_avatar_color(avatar_color)

        return JsonResponse({
            'message': 'Avatar color updated successfully!',
            'status': 'success'
        })

    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'}, status=500)
