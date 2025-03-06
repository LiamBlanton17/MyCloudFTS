from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.db import connection
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model, authenticate, login, logout
from users.models import Project, Folder, File
import json
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
import os


User = get_user_model()  # Get Django's built-in User model


def profile(request, username):
    user = User.objects.get(username=username)
    return render(request, 'profile.html', {'user': user})


@login_required(login_url='/login.html')
def profile(request):
    return render(request, 'profile.html', {'user': request.user})


@login_required(login_url='/login.html')
def dashboard(request):
    if not request.user.is_authenticated:
        return redirect('login')
    projects = request.user.projects.all().order_by('-date_created')
    return render(request, 'userdash.html', {'user': request.user, 'projects': projects})


@login_required(login_url='/login.html')
def userproject(request):
    if not request.user.is_authenticated:
        return redirect('login')
    project_id = int(request.GET.get('project_id', -1))
    folder_id = int(request.GET.get('folder_id', -1))
    if project_id == -1:  # Must have a project id
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
            login(request, user)
            print(f"User {email} successfully logged in")  # Debug log
            return JsonResponse({
                'message': f'Welcome back, {user.first_name}!',
                'status': 'success',
                'redirect': '/dashboard.html'  # Adding explicit redirect URL
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

        uploaded_file = request.FILES['file']
        if not uploaded_file:
            return JsonResponse({'message': 'No file provided!'})

        file_name = uploaded_file.name
        file_size = uploaded_file.size
        file_type = uploaded_file.content_type

        folder = None
        if folder_id == -1:  # Get root folder
            folder = Folder.objects.filter(project_id=project_id, is_root=True).first()
        else:  # Get this folder
            folder = Folder.objects.filter(folder_id=folder_id).first()

        if folder is None:
            return JsonResponse({'message': 'Invalid folder!'})

        # Add file entry to database
        file = File(
            name=file_name,
            path=f"{folder.path}{file_name}",
            size=file_size,
            file_type=file_type,
            folder_id=folder
        )
        file.save()
        print(f"Uploaded: {file} to {folder.path}")

        # Actually upload the file
        save_path = f"{folder.path}{file_name}"  # Folder path has a trailing /
        with open(save_path, "wb") as file:
            for chunk in uploaded_file.chunks():  # Read and write in chunks to handle large files
                file.write(chunk)
    
        return JsonResponse({'message': f'Successfully uploaded file!'})
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

        if not username:
            return JsonResponse({'message': 'User not logged in!'})

        # Ensure user is authenticated
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


@login_required(login_url='/login.html')
def delete_project(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        project_id = data.get('project_id', None)

        if not project_id:
            return JsonResponse({'message': 'No project_id supplied!'})

        return JsonResponse({'message': f'Not implemented! Project ID that was going to be deleted: {project_id}'})
    except Exception as e:
            return JsonResponse({'message': f'Error! {str(e)}'})

