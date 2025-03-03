# Testbed Functions
from users.models import User, Project, Folder, File

def get_files_and_folders(folder_id):
    try:
        folder = Folder.objects.get(folder_id=folder_id)
    except Folder.DoesNotExist:
        return []

    files_and_folders = []

    #Get subfolders
    #subfolders = related_name='subfolders' in Folder.parent_folder model
    subfolders = folder.subfolders.all()
    for subfolder in subfolders:
        files_and_folders.append((subfolder.folder_id, subfolder.name))

    #Get files in the folder
    files = File.objects.filter(path_starts_with = folder.path)
    for file in files:
        files_and_folders.append((file.file_id, file.name))

    #Returns a list of tuples (id, name) for both files and folders
    return files_and_folders

#Download a file
def download_file(file_id):
    try:
        file = File.objects.get(file_id=file_id)
        return file
    except File.DoesNotExist:
        return None

#Upload a new file
def upload_file(file_id, new_file):
    try:
        file = File.objects.get(file_id=file_id)
        #Save the new file to the server
        file_path = default_storage.save(f'uploads/{new_file.name}', ContentFile(new_file.read()))
        file.path = file_path
        file.save()
        return True
    except File.DoesNotExist:
        return False

#Delete a file
def delete_file(file_id):
    try:
        file = File.objects.get(file_id=file_id)
        file.delete()
        return True
    except File.DoesNotExist:
        return False

#Retrieve metadata for a file
def check_file(file_name, folder_id):
    try:
        file = File.objects.get(name=file_name, folder_id=folder_id)
        file_metadata = {
            'file_id': file.file_id,
            'name': file.name,
            'path': file.path,
            'size': file.size,
            'file_type': file.file_type,
            'date_created': file.date_created,
            'folder_id': file.folder_id
        }
        return file_metadata
    except File.DoesNotExist:
        return None

#Check if a file exists in a folder
def file_exists(file_name, folder_id):
    return File.objects.filter(name=file_name, folder_id=folder_id).exists()

#Create a new project
def create_project(name, description, root_path):
    project = Project(
        name=name,
        description=description,
        root_path=root_path
    )
    project.save()
    return project.project_id

#Project Information
def project_info(project_id):
    try:
        project = Project.objects.get(project_id=project_id)
        project_info = {
            'project_id': project.project_id,
            'name': project.name,
            'description': project.description,
            'root_path': project.root_path,
            'date_created': project.date_created,
            'date_updated': project.date_updated
        }
        return project_info
    except Project.DoesNotExist:
        return None

#Update user role in project
#Needs updating
def update_user_role(user_email, project_id, role):
    try:
        user = User.objects.get(email=user_email)
        project = Project.objects.get(project_id=project_id)
        return True
    except (User.DoesNotExist, Project.DoesNotExist):
        return False

#Create a new subfolder in a project
def create_subfolder(parent_folder_id, name, project_id):
    try:
        parent_folder = Folder.objects.get(folder_id=parent_folder_id)
    except Folder.DoesNotExist:
        return False

    try:
        project = Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        return False

    subfolder = Folder(
        name=name,
        path=f"{parent_folder.path}/{name}",
        parent_folder=parent_folder,
        project=project
    )
    subfolder.save()
    return subfolder.folder_id

#Create a new file
def create_file(file_name, folder_id, file_type, size):
    try:
        folder = Folder.objects.get(folder_id=folder_id)
    except Folder.DoesNotExist:
        return False

    file = File(
        name=file_name,
        path=f"{folder.path}/{file_name}",
        size=size,
        file_type=file_type,
        folder=folder
    )
    file.save()
    return file.file_id