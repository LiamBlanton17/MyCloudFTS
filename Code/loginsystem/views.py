from django.shortcuts import render
from django.http import HttpResponse


# Create your views here.
def home(request):
    name = "My Name"
    return render(request, 'login.html', {
        'name': name,
    })
