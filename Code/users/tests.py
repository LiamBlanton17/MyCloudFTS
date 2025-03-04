from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from users.models import Project, Folder, File


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
    
