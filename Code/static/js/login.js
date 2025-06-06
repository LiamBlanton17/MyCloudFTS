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
    if(!$("#email").val()){
        alert("Email missing!");
        $("#email").focus();
        return 0;
    }
    if(!$("#password").val()){
        alert("Password name missing!");
        $("#password").focus();
        return 0;
    }
    return 1;
}
function do_2fa_modal(){
    $('#2fa-modal').show();
    $('#2fa-modal-submit').on('click', function(e){
        e.preventDefault();
        const email = $("#email").val();
        const password = $("#password").val(); 
        const key_2fa = $("#2fa-key-input").val();
        const data = {
            email: email,
            password: password,
            key_2fa: key_2fa,
        };
        $.ajax({
            url: '/api/post/login/2fa/',
            type: 'POST',
            data: JSON.stringify(data),
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            contentType: 'application/json',
            dataType: 'json',
            success: function(response) {
                console.log('Success:', response);
                if (response.status === 'success') {
                    window.location.href = '/dashboard.html';
                } else {
                    console.log('Login failed:', response.message);
                    alert(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.log('Error:', error);
                alert('Login failed. Please try again.');
            }
        });
    });
}
$(function(){
    $('#login_btn').on('click', function(e){
        e.preventDefault();
        if(!validateForm()) return 0;
        const data = {
            email: $("#email").val(),
            password: $("#password").val(),
        };
        $.ajax({
            url: '/api/post/login/',
            type: 'POST',
            data: JSON.stringify(data),
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            contentType: 'application/json',
            dataType: 'json',
            success: function(response) {
                console.log('Success:', response);
                if (response.status === 'success') {
                    do_2fa_modal();
                } else if(response.status === 'login') {
                    window.location.href = '/dashboard.html';
                } else {
                    console.log('Login failed:', response.message);
                    alert(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.log('Error:', error);
                alert('Login failed. Please try again.');
            }
        });
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCookie,
        validateForm
    };
}