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
            },
            error: function(xhr, status, error) {
                console.log('Error:', error);
            }
        });
        location.reload();
    });
});

