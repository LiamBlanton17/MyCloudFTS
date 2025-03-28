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

$(document).ready(function() {
    const dropZone = $('#dropZone');
    const fileInput = $('#new-file-upload-input');
    const uploadBtn = $('.new-file-btn');
    const progressBar = $('.upload-progress-bar');
    const uploadStatus = $('.upload-status');
    
    // Initialize the file upload zone
    function initializeUploadZone() {
        // Handle drag and drop events
        dropZone.on('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass('drag-over');
        });

        dropZone.on('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('drag-over');
        });

        dropZone.on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('drag-over');
            
            const files = e.originalEvent.dataTransfer.files;
            handleFiles(files);
        });

        // Handle click to upload
        dropZone.on('click', function() {
            fileInput.click();
        });

        uploadBtn.on('click', function() {
            fileInput.click();
        });

        fileInput.on('change', function() {
            handleFiles(this.files);
        });
    }

    // Handle the selected files
    function handleFiles(files) {
        if (files.length === 0) return;

        // Show progress bar
        $('.upload-progress').show();
        uploadStatus.show().removeClass('success error').text('Uploading...');

        // Create FormData object
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files[]', file);
        });

        // Add CSRF token
        formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));

        // Upload files
        $.ajax({
            url: '/api/post/upload_files/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        progressBar.css('width', percent + '%');
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                uploadStatus.addClass('success').text('Upload complete!');
                setTimeout(() => {
                    $('.upload-progress').hide();
                    progressBar.css('width', '0%');
                    uploadStatus.hide();
                    location.reload(); // Refresh to show new files
                }, 1500);
            },
            error: function(xhr, status, error) {
                uploadStatus.addClass('error').text('Upload failed. Please try again.');
                setTimeout(() => {
                    $('.upload-progress').hide();
                    progressBar.css('width', '0%');
                }, 3000);
            }
        });
    }

    // Handle file actions
    function initializeFileActions() {
        // Delete file
        $(document).on('click', '.file-delete', function(e) {
            e.preventDefault();
            const fileId = $(this).data('file-id');
            const fileName = $(this).closest('.file-card').find('.file-name').text();
            
            if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
                $.ajax({
                    url: '/api/post/delete_file/',
                    type: 'POST',
                    data: JSON.stringify({
                        file_id: fileId
                    }),
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    contentType: 'application/json',
                    success: function(response) {
                        $(`[data-file-id="${fileId}"]`).closest('.file-card').fadeOut(300, function() {
                            $(this).remove();
                            // Show no files message if no files left
                            if ($('.file-card').length === 0) {
                                $('.file-grid').append(`
                                    <div class="no-files-message">
                                        <i class="fas fa-folder-open"></i>
                                        <p>No files uploaded yet</p>
                                        <p class="upload-hint">Upload your first file to get started</p>
                                    </div>
                                `);
                            }
                        });
                    },
                    error: function(xhr, status, error) {
                        alert('Failed to delete file. Please try again.');
                    }
                });
            }
        });

        // Rename file
        $(document).on('click', '.rename-btn', function(e) {
            e.preventDefault();
            const fileCard = $(this).closest('.file-card');
            const fileId = $(this).data('file-id');
            const currentName = fileCard.find('.file-name').text();
            
            const newName = prompt('Enter new file name:', currentName);
            if (newName && newName !== currentName) {
                $.ajax({
                    url: '/api/post/rename_file/',
                    type: 'POST',
                    data: JSON.stringify({
                        file_id: fileId,
                        new_name: newName
                    }),
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    contentType: 'application/json',
                    success: function(response) {
                        fileCard.find('.file-name').text(newName);
                    },
                    error: function(xhr, status, error) {
                        alert('Failed to rename file. Please try again.');
                    }
                });
            }
        });

        // Share file
        $(document).on('click', '.share-btn', function(e) {
            e.preventDefault();
            const fileId = $(this).data('file-id');
            // Implement share functionality
            alert('Share functionality coming soon!');
        });
    }

    // Initialize everything
    initializeUploadZone();
    initializeFileActions();
});

// Initialize dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle dropdown toggles
    document.querySelectorAll('.dropdown-toggle').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== this.nextElementSibling) {
                    menu.classList.remove('show');
                }
            });
            
            // Toggle this dropdown
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('show');
            
            // Update aria-expanded
            this.setAttribute('aria-expanded', dropdownMenu.classList.contains('show'));
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                toggle.setAttribute('aria-expanded', 'false');
            });
        }
    });
});

// Initialize file upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadBtn = document.getElementById('uploadFilesBtn');
    const uploadModal = document.getElementById('fileUploadModal');
    const closeBtn = uploadModal.querySelector('.close');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('new-file-upload-input');
    const progressBar = document.querySelector('.upload-progress-bar');
    const uploadStatus = document.querySelector('.upload-status');

    // Open modal when clicking upload button
    uploadBtn.addEventListener('click', function() {
        uploadModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    // Close modal when clicking X
    closeBtn.addEventListener('click', function() {
        uploadModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Handle drag and drop events
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Handle click to upload
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Handle file upload
    function handleFiles(files) {
        if (files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files[]', file);
        });

        // Show progress bar
        const progressContainer = document.querySelector('.upload-progress');
        progressContainer.style.display = 'block';
        uploadStatus.style.display = 'block';
        uploadStatus.textContent = 'Uploading...';
        uploadStatus.className = 'upload-status';

        // Get project_id from URL
        const urlParams = new URLSearchParams(window.location.search);
        const project_id = urlParams.get('project_id') || -1;

        // Upload files
        $.ajax({
            url: `/api/post/upload_file/?project_id=${project_id}`,
            type: 'POST',
            data: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        progressBar.style.width = percent + '%';
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                uploadStatus.textContent = 'Upload complete!';
                uploadStatus.classList.add('success');
                
                setTimeout(() => {
                    uploadModal.style.display = 'none';
                    document.body.style.overflow = '';
                    location.reload(); // Refresh to show new files
                }, 1500);
            },
            error: function(xhr, status, error) {
                uploadStatus.textContent = 'Upload failed. Please try again.';
                uploadStatus.classList.add('error');
                
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                }, 3000);
            }
        });
    }
});