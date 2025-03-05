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
});