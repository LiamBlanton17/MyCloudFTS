from django.shortcuts import render
from .functions import * #Change to import only the functions you need

# Create your views here.
def testbed(request):
	return render(request, "testbed.html")


def upload_file(request):
	uploaded_file = request.FILES['file']
	file_name = uploaded_file.name


    #with open(f'media/uploads/{file_name}', 'wb+') as destination:
    #	for chunk in uploaded_file.chunks():
    #        destination.write(chunk)
	return JsonResponse({'message': 'File uploaded successfully!'})