// Add this function to get CSRF token
function getCookie(name) {
   let cookieValue = null;
   if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(
          cookie.substring(name.length + 1)
        );
        break;
      }
    }
  }
  return cookieValue;
}

$(() => {
    $('.new-file-btn').click(function(e) {
        e.preventDefault();
        $('#new-file-upload-input').click();
    });
    $('#new-file-upload-input').on('change', function(e) {
        e.preventDefault();
        console.log("file change");
        let file = this.files[0];
        if (!file) return;
        let formData = new FormData();
        formData.append('file', file);
        const urlParams = new URLSearchParams(window.location.search);
        const project_id = urlParams.get('project_id') || -1;
        const folder_id = urlParams.get('folder_id') || -1;
        $.ajax({
            url: `api/post/upload_file/?project_id=${project_id}&folder_id=${folder_id}`,
            type: 'POST',
            data: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            processData: false,
            contentType: false,
            success: function(response) {
                console.log('Success:', response.message);
                alert(response.message);
                location.reload();
            },
            error: function(xhr, status, error) {
                console.log('Error:', error);
            }
        });
    });
    
    // Dropdown functionality for userproject.html
    $(document).on('click', '.dropdown-toggle', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Close all other dropdowns first
        $('.dropdown-menu').not($(this).next('.dropdown-menu')).removeClass('show');
        $('.dropdown-toggle').not(this).attr('aria-expanded', 'false');
        
        // Toggle this dropdown with clear visual feedback
        const $menu = $(this).next('.dropdown-menu');
        $menu.toggleClass('show');
        
        // Update aria state
        const expanded = $menu.hasClass('show');
        $(this).attr('aria-expanded', expanded);
        
        console.log('Dropdown ' + (expanded ? 'opened' : 'closed'));
    });
    
    // Close dropdown when clicking elsewhere
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown').length) {
            $('.dropdown-menu').removeClass('show');
            $('.dropdown-toggle').attr('aria-expanded', 'false');
        }
    });
    
    // Initialize dropdowns
    $('.dropdown-menu').removeClass('show');
    $('.dropdown-toggle').attr('aria-expanded', 'false');
    
    // Handle file deletion
    $(document).on('click', '.file-delete', function(e) {
        e.preventDefault();
        const file_id = $(this).data('file-id');
        if(!file_id){
            console.log('File ID not found');
            return;
        }
        
        if (confirm('Are you sure you want to delete this file?')) {
            // Your delete file AJAX call here
            $.ajax({
                url: `/api/post/delete_file/`,
                type: 'POST',
                data: JSON.stringify({ 
                    action: 'delete',
                    file_id: file_id
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
                    console.log('Delete file ID:', file_id);
                }
            });
        }
    });
});