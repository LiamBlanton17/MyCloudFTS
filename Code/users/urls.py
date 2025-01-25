from django.urls import path
from . import views
from django.views.generic.base import RedirectView

urlpatterns = [
    path('login.html', views.home, name='login'),
    path('landingpage.html', views.landing_page, name='landingpage'),
    path('', RedirectView.as_view(url='landingpage.html', permanent=True)),
]
