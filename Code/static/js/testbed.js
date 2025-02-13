//Upload a file
$(() => {
    $('#file_upload').on('change', function(e) {
        e.preventDefault();  
        let file = this.files[0];
        if (!file) return;
        let formData = new FormData();
        formData.append('file', file);
        $.ajax({
            url: '/api/testbed/file_upload/',
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
            },
            error: function(xhr, status, error) {
                console.log('Error:', error);
            }
        });
    });
});