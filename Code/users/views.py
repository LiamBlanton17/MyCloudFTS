from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.db import connection
from .models import User, Company
import json

def home(request):
    return render(request, 'login.html')


def landing_page(request):
    return render(request, 'landingpage.html')


def signup(request):
    return render(request, 'signup.html')


def api_sign_up(request):
    # Get information from the POST
    data = json.loads(request.body)
    company_name = data.get('company', None)
    first_name = data.get('first_name', None)
    last_name = data.get('last_name', None)
    password = data.get('password', None)
    email = data.get('email', None)

    # Confirm unique company name
    if Company.objects.filter(company_name = company_name).exists():
        return JsonResponse({'message': f'Error!\nCompany name taken!'})

    # Confirm unique email
    if User.objects.filter(email = email).exists():
        return JsonResponse({'message': f'Error!\nEmail already in use!'})

    # Insert into database
    try:
        company = Company.objects.create(
            company_name = company_name,
            is_deleted = 0,
            subscription_type = 0
        )
        user = User.objects.create(
            first_name = first_name,
            last_name = last_name,
            email = email,
            user_type = 3,
            password = password,
            is_deleted = 0,
            company = company  # Connecting forgein key
        )
    except:
        return JsonResponse({'message': f'Error!\nCreation failed, internal error!'})

    # Return success message
    return JsonResponse({'message': f'Hello, {first_name}!\nYour company, {company_name}, has been created!'})
