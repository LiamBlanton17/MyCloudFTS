
# functions.py is used to store functions (not views) that are needed by views.py

from django.http import JsonResponse, HttpResponse
from users.models import Project, Folder, File
from django.contrib.auth.models import User
import os


# Function to download a file. 
# Either returns an httpresponse object which can be sent to the browers or a JSON error message.
def get_file_download(file_id):
    try:
        if not file_id:
            return JsonResponse({'message': f'Error! No file_id provided!'}, status=404)

        requested_file = File.objects.filter(file_id=file_id).first()

        if not requested_file:
            return JsonResponse({'message': f'Error! No file in file model!'}, status=404)

        if not os.path.exists(requested_file.path):
            return JsonResponse({'message': f'Error! No file path!'}, status=404)

        with open(requested_file.path, 'rb') as file:
            response = HttpResponse(file.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(requested_file.name)}"'
            return response

    except Exception as e:
        return JsonResponse({'message': f'Error! {str(e)}'}, status=500)