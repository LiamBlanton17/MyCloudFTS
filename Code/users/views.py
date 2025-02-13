from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.db import connection
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model, authenticate, login
import json

User = get_user_model()  # Get Django's built-in User model

def dashboard(request):
    return render(request, 'userdash.html')

def home(request):
    return render(request, 'login.html')


def landing_page(request):
    return render(request, 'landingpage.html')


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

        return JsonResponse({'message': f'Hello, {first_name}! Your account has been created!'})

    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'})


def api_login(request):
    if request.method != "POST":
        return JsonResponse({'message': 'Invalid request method'})

    try:
        data = json.loads(request.body)
        email = data.get('email', None)
        password = data.get('password', None)

        if not email or not password:
            return JsonResponse({'message': 'Email and password are required!'})

        user = authenticate(username=email, password=password)  # Authenticate user

        if user is not None:
            login(request, user)
            return JsonResponse({'message': f'Welcome back, {user.first_name}!'})
        else:
            return JsonResponse({'message': 'Invalid email or password!'})

    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'})
