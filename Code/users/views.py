from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.db import connection
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model, authenticate, login, logout
from users.models import Project, UserProject
import json
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required

User = get_user_model()  # Get Django's built-in User model

@login_required(login_url='/login.html')
def dashboard(request):
    if not request.user.is_authenticated:
        return redirect('login')
    #projects = Project.objects.filter(user=request.user)
    projects = Project.objects.all().order_by('-date_created')
    return render(request, 'userdash.html', {'user': request.user, 'projects': projects})

@login_required(login_url='/login.html')
def userproject(request):
    if not request.user.is_authenticated:
        return redirect('login')
    #projects = Project.objects.filter(user=request.user)
    projects = Project.objects.all().order_by('-date_created')
    return render(request, 'userproject.html', {'user': request.user, 'projects': projects})

def home(request):
    return render(request, 'login.html')


def landing_page(request):
    return render(request, 'landingpage.html')


    return render(request, 'userproject.html')

def signup(request):
    return render(request, 'signup.html')


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


def create_project(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'})

    try:
        data = json.loads(request.body)
        project_name = data.get('projectName', None)
        project_description = data.get('projectDescription', None)

        username = request.user.username

        if not project_name or not project_description:
            return JsonResponse({'message': 'Project name and description are required!'})

        if not username:
            return JsonResponse({'message': 'User not logged in!'})

        # This should be per user not global, so people can have the same project
        if Project.objects.filter(name=project_name).exists():
            return JsonResponse({'message': 'Project name already exists!'})

        new_project = Project(name=project_name, root_path=f'/media/{username}/{project_name}/', description=project_description)
        new_project.save()
        return JsonResponse({'message': 'Project created successfully!'})
    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'})
