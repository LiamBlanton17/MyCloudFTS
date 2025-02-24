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
$(function(){
    $('.submit-btn').on("click", function(e){
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
                /**************************************************************/
                // New Code
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
                /**************************************************************/
                //location.reload();
            },
            error: function(xhr, status, error) {
                console.log('Error:', error);
            }
        });
    });
});

