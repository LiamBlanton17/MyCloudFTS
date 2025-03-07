import os
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from users.models import Project, Folder, File
from django.core.exceptions import ValidationError

# Class to test project creation
class CreateProjectTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')
        self.url = reverse('createproject') # This gets the url associated with the view create_project

    # Integration Tests - Simulate the AJAX Post the user would trigger
    def test_valid_create_project(self):
        # Simulate the AJAX Post the user would trigger multiple times
        # First POST is valid
        # Second POST is invalid, as project names are unique
        # Third POST is invalid, as project names are required
        test_POST = {
            'Valid': {'projectName': 'New Project', 'projectDescription': 'Test Description'},
            'Invalid_1': {'projectName': 'New Project', 'projectDescription': 'Test 2 Description'},
            'Invalid_2': {'projectDescription': 'Project Description'}
        }

        # Send and check the Valid POST
        # Verify correct JSON response
        # Verify that the project was created
        # Verify that the root folder was created
        response = self.client.post(self.url, test_POST['Valid'], content_type='application/json')
        response_data = response.json()
        project = Project.objects.get(name=test_POST['Valid']['projectName'])
        folder = Folder.objects.filter(project_id=project.project_id, is_root=True).all()
        self.assertEqual(response_data['message'], 'Project created successfully!')
        self.assertEqual(project.description, test_POST['Valid']['projectDescription'])
        self.assertEqual(len(folder), 1)

        # Send and check the first Invalid POST
        # Verify correct JSON response
        response = self.client.post(self.url, test_POST['Invalid_1'], content_type='application/json')
        response_data = response.json()
        self.assertEqual(response_data['message'], 'Project name already exists!')

        # Send and check the second Invalid POST
        response = self.client.post(self.url, test_POST['Invalid_2'], content_type='application/json')
        response_data = response.json()
        self.assertEqual(response_data['message'], 'Project name and description are required!')

        # Simulate a GET HTTP request
        # This is an invalid HTTP method for this function
        response = self.client.get(self.url)
        response_data = response.json()
        self.assertEqual(response.status_code, 405) 
        self.assertEqual(response_data['message'], 'Invalid request method')
    
    # White-box unit tests
    def test_project_view(self):
        pass
    

    # Black-box unit tests
    def test_file_upload(self):
        pass

# Integration Tests
# Class to test project deletion
class DeleteProjectTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')
        self.project = Project.objects.create(
            name='Test Project', 
            description='Test Description', 
            root_path='testpath')
        self.project.user.set([self.user])
        self.url = reverse('deleteproject') # This gets the url associated with the view 'deleteproject'
        
        # Create the root folder for the project
        self.root_folder = Folder.objects.create(
            project=self.project,
            path=self.project.root_path,
            name='Root Folder',
            is_root=True
        )

        # Create a file in the root folder
        self.file = File.objects.create(
            folder_id=self.root_folder,
            name='Test File',
            path=self.root_folder.path,
            size=100,
            file_type='txt'
        )

    # Integration Tests Section - Simulate the AJAX Post the user would trigger
    def test_delete_project(self):
        data = {
            'project_id': self.project.project_id,
            'action': 'delete'
        }

        # Send the DELETE request 
        response = self.client.post(self.url, data, content_type='application/json')
        response_data = response.json()

        # Verify correct HTTP status code
        self.assertEqual(response.status_code, 200)

        # Verify correct JSON response
        self.assertEqual(response_data['message'], 'Project 1 deleted successfully!')

        # Verify that the project was deleted
        self.assertEqual(Project.objects.filter(project_id=self.project.project_id).count(), 0)

        # Verify that the root folder was deleted
        self.assertFalse(os.path.exists(self.project.root_path))

        # Verify that the project is no longer associated with the user
        self.assertEqual(self.user.projects.count(), 0)

        # Verify that the project's folders and files were deleted
        self.assertEqual(Folder.objects.filter(project_id=self.project.project_id).count(), 0)
        self.assertEqual(File.objects.filter(folder_id__project_id=self.project.project_id).count(), 0)

    # Test attempted deletion of a project after user logout - unauthorized access
    def test_delete_project_unauthorized(self):
        self.client.logout()
        data = {
            'project_id': self.project.project_id,
            'action': 'delete'
        }
        response = self.client.post(self.url, data, content_type='application/json')
        
        # User receives a 302 status code and is redirected to the login page
        self.assertEqual(response.status_code, 302)

        # Follow the redirect to the login page
        response = self.client.get(response.url)

        # Verify the final response is status code 200 for the login page, and contains the login form
        self.assertEqual(response.status_code, 200)
        self.assertIn('login', response.content.decode())

    # Test attempted deletion of a project that does not exist
    def test_delete_non_existant_project(self):
        data = {
            'project_id': 999,
            'action': 'delete'
        }
        response = self.client.post(self.url, data, content_type='application/json')
        response_data = response.json()

        # Verify correct HTTP status code
        self.assertEqual(response.status_code, 404)

        # Verify correct JSON response
        self.assertEqual(response_data['message'], 'Project does not exist!')

    
    
    # Black-box unit tests 
    # Test deletion with missing or invalid request data 
    def test_delete_project_invalid_data(self):

        # Test 1 - Missing 'action' field
        data = {'project_id': self.project.project_id} 
        response = self.client.post(self.url, data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('message', response.json()) # Verify that the response contains an error message   

        # Test 2 - Missing 'project_id' field
        data = {'action': 'delete'}
        response = self.client.post(self.url, data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('message', response.json())

        # Test 3 - Invalid 'project_id' (non-integer)
        data = {'project_id': 'invalid_id', 'action': 'delete'}
        response = self.client.post(self.url, data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('message', response.json())

        # Test 4 - Empty request body 
        data = {}
        response = self.client.post(self.url, data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('message', response.json())

        # Test 5 - Invalid 'action' field
        data = {'project_id': self.project.project_id, 'action': 'remove'}
        response = self.client.post(self.url, data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('message', response.json())


# White-box unit tests - Statement Coverage
# Project model being tested
# class Project(models.Model):
#     project_id = models.AutoField(primary_key=True)
#     root_path = models.CharField(max_length=255)
#     name = models.CharField(max_length=255)
#     description = models.TextField(blank=True, null=True)
#     date_created = models.DateTimeField(auto_now_add=True)
#     date_updated = models.DateTimeField(auto_now=True)
#     user = models.ManyToManyField(User, related_name="projects")

#     def __str__(self):
#         return self.name

# Class to test the project model and it's fields 
class ProjectModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')

    # Test the string method of the project model
    def test_project_str_method(self):
        self.project = Project.objects.create(
            name='Test Project', 
            description='Test Description', 
            root_path='testpath')
        self.project.user.set([self.user])
        self.assertEqual(str(self.project), 'Test Project')

    # Test the project_root max length constraint is enforced
    def test_project_root_max_length(self):
        long_path = 'a' * 256 # Max allowed length is 255
        project = Project(name='Test Project', description='Test Description', root_path=long_path)
        
        with self.assertRaises(ValidationError):
            project.full_clean() # This triggers Django model validation enforcing length check

    # Test the project name max length constraint is enforced
    def test_project_name_max_length(self):
        long_name = 'a' * 256 # Max allowed length is 255
        project = Project(name=long_name, description='Test Description', root_path='testpath')
        
        with self.assertRaises(ValidationError):
            project.full_clean() # This triggers Django model validation enforcing length check

    # Test the project description is optional, null and blank are allowed
    def test_project_description_optional(self):
        project = Project.objects.create(name='Test Project', root_path='testpath')
        self.assertIsNone(project.description)

    # Test the project user relationship
    def test_project_user_relationship(self):
        project = Project.objects.create(name='Test Project', root_path='testpath')
        project.user.add(self.user)
        self.assertIn(self.user, project.user.all())

    # Test date_created and date_updated fields are automattically filled in
    def test_date_created_updated_auto_fill(self):
        project = Project.objects.create(name='Test Project', root_path='testpath')
        self.assertIsNotNone(project.date_created)
        self.assertIsNotNone(project.date_updated) 

    # Test project with no users - Edge case, views.py assigns user to project on creation
    # but many to many field allows for no users
    def test_project_no_users(self):
        project = Project.objects.create(name='Test Project', root_path='testpath')
        self.assertEqual(project.user.count(), 0)

    # Test project with mutltiple users
    def test_project_multiple_users(self):
        project = Project.objects.create(name='Test Project', root_path='testpath')
        project.user.add(self.user)
        
        user2 = User.objects.create_user(username='testuser2', password='password')
        project.user.add(user2)
        
        # Verify user count is two, and that both users are associated with the same project
        self.assertEqual(project.user.count(), 2)
        self.assertIn(self.user, project.user.all())
        self.assertIn(user2, project.user.all())



        
        
    


