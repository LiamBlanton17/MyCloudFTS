from django.urls import path
from . import views
from django.views.generic.base import RedirectView

urlpatterns = [
    path('login.html', views.home, name='login'),
    path('landingpage.html', views.landing_page, name='landingpage'),
    path('signup.html', views.signup, name='signup'),
    path('', RedirectView.as_view(url='landingpage.html', permanent=True)),
    path('dashboard.html', views.dashboard, name='dashboard'),
    # Below are api POSTS
    path('api/post/sign_up/', views.api_sign_up, name='signup'),
    path('api/post/login/', views.api_login, name='login'),
]
