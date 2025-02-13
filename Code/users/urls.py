from django.urls import path
from . import views
from django.views.generic.base import RedirectView

urlpatterns = [
    path('login.html', views.home, name='login'),
    path('landingpage.html', views.landing_page, name='landingpage'),
    path('signup.html', views.signup, name='signup'),
    path('', RedirectView.as_view(url='landingpage.html', permanent=True)),
<<<<<<< HEAD
    path('dashboard.html', views.dashboard, name='dashboard'),
=======
>>>>>>> dadbfc3e1a24f048b88ea261ae4ec7b25c1afac5
    # Below are api POSTS
    path('api/post/sign_up/', views.api_sign_up, name='signup'),
    path('api/post/login/', views.api_login, name='login'),
]
