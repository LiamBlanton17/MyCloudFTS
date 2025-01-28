from django.shortcuts import render
from django.http import HttpResponse
from django.db import connection


# Create your views here.
def home(request):
    return render(request, 'login.html')


# Create your views here.
def landing_page(request):
    return render(request, 'landingpage.html')

def signup(request):
    return render(request, 'signup.html')
