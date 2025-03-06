//django docs provided this, even though it looks wacky. Probably a library for it?
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function validateForm(){
    if(!$("#projectName").val()){
        alert("Project Name missing!");
        $("#projectName").focus();
        return 0;
    }
    if(!$("#projectDescription").val()){
        alert("Project Description missing!");
        $("#projectDescription").focus();
        return 0;
    }
    return 1;
}

//Create Project - Send Project Info to Database
$(() => {
    $(function(){
        console.log('userdash.js loaded');
        $('.submit-btn').on("click", function(e){
            console.log('Create Project Button Clicked');
            e.preventDefault();
            if(!validateForm()){
                return;
            }
            const data = {
                projectName: $("#projectName").val(),
                projectDescription: $("#projectDescription").val(),
            };
            $.ajax({
                url: '/api/post/create_project/',
                type: 'POST',
                data: JSON.stringify(data),
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                contentType: 'application/json',
                dataType: 'json',
                success: function(response) {
                    console.log('Success:', response);
                    alert(response.message);

                    // Dynamically add the new project to the grid
                    const project = response.project;

                    const newProjectCard = `
                        <div class="project-card" id="project-${project.id}">
                            <div class="project-card-header">
                                <h3>${project.name}</h3>
                                <span class="project-date">Created: ${new Date().toLocaleDateString()}</span>
                            </div>
                            <p class="project-description">${project.description}</p>
                            <div class="project-actions">
                                <!-- Dynamically set the href link to include the project ID -->
                                <a href="/userproject/${project.id}/" class="view-project">View Project</a>
                            </div>
                        </div>
                    `;
                    
                    // Add the new project card to the projects grid
                    $(".projects-grid").append(newProjectCard);
    
                    // Close the modal
                    modal.style.display = "none";
    
                    // Clear the form fields
                    $('#newProjectForm').trigger("reset");
                },
                error: function(xhr, status, error) {
                    console.log('Error:', error);
                }
            });
        });

        // Project Delete Button
        $(document).on('click', '.delete-project-btn', function(e) {
            e.preventDefault();
            console.log('Delete Project Button Clicked');
            //const project_id = $(this).attr('id');
            const project_id = $(this).data('project-id');
            if(!project_id){
                console.log('Project ID not found');
                return;
            }
            console.log('Project ID:', project_id);

            const data = {
                project_id: project_id,
            };
        
            if (confirm('Are you sure you want to delete this project?')) {
                $.ajax({
                    //url: `/delete_project/${projectId}/`,
                    url: `/api/post/delete_project/`,
                    type: 'POST',  // Change from DELETE to POST
                    data: JSON.stringify({ 
                        action: 'delete', // Sending the action parameter
                        project_id: project_id //Pass the project_id to the backend
                    }),  
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function(response) {
                        console.log('Success:', response);
                        alert(response.message);
                        //$(`#project-${projectId}`).remove();
                        location.reload();  // Reload the page after deletion
                    },
                    error: function(xhr, status, error) {
                        console.log('Error:', error);
                        console.log('Status:', status);
                        console.log('XHR:', xhr);
                    }
                });
            }
        });
    });

    // Add event listener for project settings buttons
    $(document).on('click', '.project-settings', function(e) {
        e.preventDefault();
        console.log('Project Settings Button Clicked');
    });
});
