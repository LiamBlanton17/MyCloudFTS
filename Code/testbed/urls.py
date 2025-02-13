from django.urls import path
from . import views
from django.views.generic.base import RedirectView

urlpatterns = [
	path('api/testbed/upload_file', views.upload_file, name='upload_file'),
	path('testbed.html', views.testbed, name='testbed'),
]
