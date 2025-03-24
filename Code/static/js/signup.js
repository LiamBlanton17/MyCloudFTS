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
    if(!$("#firstname").val()){
        alert("First name missing!");
        $("#firstname").focus();
        return 0;
    }
    if(!$("#lastname").val()){
        alert("Last name missing!");
        $("#lastname").focus();
        return 0;
    }
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
    if(!$("#terms").is(':checked')){
        alert("Must agree to terms!");
        $("#terms").focus();
        return 0;
    }
    return 1;
}
$(function(){
    $('#signup-submit').on("click", function(){
        if(!validateForm()){
            return;
        }
        const data = {
            first_name: $("#firstname").val(),
            last_name: $("#lastname").val(),
            email: $("#email").val(),
            password: $("#password").val(),
        };
        console.log(data);
        $.ajax({
            url: '/api/post/sign_up/',
            type: 'POST',
            data: JSON.stringify(data),
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            contentType: 'application/json',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    console.log('Redirecting to dashboard...');
                    window.location.href = response.redirect;
                } else {
                    console.log('Login failed:', response.message);
                    alert(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.log('Error:', error);
            }
        });
    });
});

function send_mail(){
    const email = document.getElementById('email').value;
    fetch('api/post/send_mail/', 
        { method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email})
        }
    )
    .then(response => response.json())
    .then(data => {alert(data.message || data.error);})
    .catch(error => console.error('error: ', error));
};

module.exports = {
    getCookie,
    validateForm,
};