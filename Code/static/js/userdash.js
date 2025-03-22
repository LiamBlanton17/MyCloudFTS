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
        
        // Check if there are any project cards (excluding the no-projects message)
        const projectCount = $('.project-card').not('#no-projects-message').length;
        if (projectCount > 0) {
            $("#no-projects-message").addClass('hidden');
        }
        
        // Global variables for modals
        const projectModal = document.getElementById("newProjectModal");
        const memberModal = document.getElementById("addMemberModal");
        
        // Improved dropdown functionality with animations
        $(document).on('click', '.dropdown-toggle', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const $this = $(this);
            const $menu = $this.next('.dropdown-menu');
            const wasOpen = $menu.hasClass('show');
            
            // Close all other dropdowns first
            $('.dropdown-menu').not($menu).removeClass('show');
            $('.dropdown-toggle').not($this).attr('aria-expanded', 'false');
            
            // Toggle this dropdown with improved visual feedback
            $menu.toggleClass('show');
            
            // Update aria state
            const isOpen = !wasOpen;
            $this.attr('aria-expanded', isOpen);
            
            // Add a subtle animation to the icon on toggle
            if (isOpen) {
                $this.addClass('active');
            } else {
                setTimeout(() => {
                    $this.removeClass('active');
                }, 200); // Match this with the transition duration
            }
        });
        
        // Close dropdown when clicking elsewhere with improved handling
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.dropdown').length) {
                const $openDropdowns = $('.dropdown-menu.show');
                
                if ($openDropdowns.length) {
                    $openDropdowns.removeClass('show');
                    $('.dropdown-toggle[aria-expanded="true"]').attr('aria-expanded', 'false');
                    setTimeout(() => {
                        $('.dropdown-toggle.active').removeClass('active');
                    }, 200);
                }
            }
        });
        
        // Ensure proper initialization on page load
        function initializeDropdowns() {
            $('.dropdown-menu').removeClass('show');
            $('.dropdown-toggle').attr('aria-expanded', 'false').removeClass('active');
            
            // Add proper ARIA attributes for accessibility
            $('.dropdown-toggle').attr({
                'aria-haspopup': 'true',
                'role': 'button'
            });
            
            $('.dropdown-menu').attr('role', 'menu');
            $('.dropdown-menu a').attr('role', 'menuitem');
        }
        
        // Call initialization on page load
        initializeDropdowns();
        
        // Handle delete project from dropdown
        $(document).on('click', '.delete-project-link', function(e) {
            e.preventDefault();
            const project_id = $(this).data('project-id');
            if(!project_id){
                console.log('Project ID not found');
                return;
            }
            console.log('Delete Project ID:', project_id);
            
            if (confirm('Are you sure you want to delete this project?')) {
                $.ajax({
                    url: `/api/post/delete_project/`,
                    type: 'POST',
                    data: JSON.stringify({ 
                        action: 'delete',
                        project_id: project_id
                    }),  
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function(response) {
                        console.log('Success:', response);
                        location.reload();  // Reload the page after deletion
                    },
                    error: function(xhr, status, error) {
                        console.log('Error:', error);
                        console.log('Status:', status);
                        console.log('XHR:', xhr);
                        console.log('Delete project ID:', project_id);
                    }
                });
            }
        });
        
        // Open the Add Member modal
        $(document).on('click', '.add-member-btn', function(e) {
            e.preventDefault();
            const project_id = $(this).data('project-id');
            
            // Set the project ID in the hidden field
            $('#memberProjectId').val(project_id);
            
            // Close dropdown and show modal
            $('.dropdown-menu').removeClass('show');
            memberModal.style.display = "block";
        });
        
        // Close the Add Member modal
        $('.close-member-modal').on('click', function() {
            memberModal.style.display = "none";
            $('#addMemberForm').trigger("reset");
        });
        
        // Also close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === memberModal) {
                memberModal.style.display = "none";
                $('#addMemberForm').trigger("reset");
            }
        });
        
        // Handle Add Member form submission
        $('#addMemberBtn').on('click', function(e) {
            e.preventDefault();
            
            const email = $('#memberEmail').val();
            const project_id = $('#memberProjectId').val();
            
            if (!email) {
                alert('Please enter an email address');
                return;
            }
            
            console.log(`Adding member with email ${email} to project ${project_id}`);
            
            // Here you would typically make an AJAX call to add the member
            // For now we'll just show a success message
            alert(`Invitation sent to ${email}`);
            
            // Close the modal and reset the form
            memberModal.style.display = "none";
            $('#addMemberForm').trigger("reset");
            
            /* 
            // Uncomment this when you have a backend endpoint
            $.ajax({
                url: '/api/post/add_project_member/',
                type: 'POST',
                data: JSON.stringify({
                    project_id: project_id,
                    email: email
                }),
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                contentType: 'application/json',
                dataType: 'json',
                success: function(response) {
                    console.log('Success:', response);
                    alert(response.message);
                    memberModal.style.display = "none";
                    $('#addMemberForm').trigger("reset");
                },
                error: function(xhr, status, error) {
                    console.log('Error:', error);
                    alert('Failed to add member. Please try again.');
                }
            });
            */
        });
        
        // Create Project Form submission
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
                    // Remove the alert
                    // alert(response.message);

                    // Dynamically add the new project to the grid
                    const project = response.project;

                    const newProjectCard = `
                        <div class="project-card" id="project-${project.id}">
                            <div class="project-card-header">
                                <h3>${project.name}</h3>
                                <span class="project-date">Created: ${new Date().toLocaleDateString()}</span>
                            </div>
                            <p class="project-description">${project.description}</p>
                            <div class="project-members">
                                <h4>Team Members:</h4>
                                <div class="member-avatars">
                                </div>
                            </div>
                            <div class="project-actions">
                                <a href="./userproject.html?project_id=${project.id}" class="view-project">View Project</a>
                                <div class="dropdown">
                                    <button class="dropdown-toggle" 
                                           data-project-id="${project.id}" 
                                           aria-haspopup="true" 
                                           aria-expanded="false"
                                           aria-label="Project options">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <div class="dropdown-menu" role="menu">
                                        <a href="#" class="add-member-btn" data-project-id="${project.id}" role="menuitem">
                                            <i class="fas fa-user-plus"></i> Add Member
                                        </a>
                                        <a href="#" class="delete-project-link" data-project-id="${project.id}" role="menuitem">
                                            <i class="fas fa-trash"></i> Delete Project
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Hide the "No projects yet" message if it exists
                    $("#no-projects-message").addClass('hidden');
                    
                    // Add the new project card to the projects grid
                    $(".projects-grid").append(newProjectCard);
    
                    // Close the modal
                    projectModal.style.display = "none";
    
                    // Clear the form fields
                    $('#newProjectForm').trigger("reset");
                },
                error: function(xhr, status, error) {
                    console.log('Error:', error);
                }
            });
        });
    });
});
