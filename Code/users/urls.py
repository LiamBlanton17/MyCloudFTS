from django.urls import path
from . import views
from django.views.generic.base import RedirectView

urlpatterns = [
    path('login.html', views.home, name='login'),
    path('landingpage.html', views.landing_page, name='landingpage'),
    path('signup.html', views.signup, name='signup'),
    path('', RedirectView.as_view(url='landingpage.html', permanent=True)),
    path('pricing.html', views.pricing, name='pricing'),
    path('confirmation.html', views.confirmation, name='confirmation'),
    path('dashboard.html', RedirectView.as_view(url='userdash.html', permanent=True)),
    path('userdash.html', views.dashboard, name='dashboard'),
    path('userproject.html', views.userproject, name='userproject'),
    path('profile.html', views.profile, name='profile'),
    path('profile/<str:username>/', views.profile, name='profile'),
    path('settings.html', views.settings, name='settings'),
    
    # path('delete_project/<int:project_id>/', views.delete_project, name='delete_project'),

    #path('logout/', views.logout_view, name='logout'),
    # Below are api POSTS
    path('api/post/sign_up/', views.api_sign_up, name='signup'),
    path('api/post/logout/', views.api_logout, name='logout'),
    path('api/post/login/', views.api_login, name='login_api'),
    path('api/post/create_project/', views.create_project, name='createproject'),

    path('api/post/upload_file/', views.upload_file, name='uploadfile'),
    path('api/post/download_file/', views.download_file, name='downloadfile'),
    path('api/post/delete_file/', views.delete_file, name='deletefile'),
    path('api/post/delete_project/', views.delete_project, name='deleteproject'),
    
    path('api/post/rename_project', views.rename_project, name='renameproject'),
    path('api/post/invite_to_project/', views.invite_to_project, name='invitetoproject'),
    path('api/post/join_project/', views.join_project, name='joinproject'),
    path('api/post/send_mail/', views.confirmation_mail, name='send_mail'),
]
