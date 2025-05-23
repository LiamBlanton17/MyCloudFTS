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

function validatePlan() {
    if (!$("input[name='uo']:checked").val()) {
        alert("Please select a pricing plan!");
        return 0;
    }
    return 1;
}

function setupPricingPage() {
    $("input[name='uo']").on("change", function () {
        $(".silver, .gold, .platinum").removeClass("selected");

        const selection = $(this).val();
        if (selection === "0" ) {
            $(".silver").addClass("selected");
        } else if (selection === "1" ) {
            $(".gold").addClass("selected");
        } else if (selection === "2" ) {
            $(".platinum").addClass("selected");
        }
    });

    $('.continue-btn').on("click", function () {
        if (!validatePlan()) {
            return;
        }

        let planChoice = {};
        const selectedPlan = $("input[name='uo']:checked").val();

        if (selectedPlan === "0") {
            planChoice = {
                plan_name: "Silver",
                price: "$0",
                description: "Free for 30 days. $10/month after trial period."
            };
        } else if (selectedPlan === "1") {
            planChoice = {
                plan_name: "Gold",
                price: "$20/month",
                description: "Perfect for teams of 2-3 professionals and suited for small-scale projects."
            };
        } else if (selectedPlan === "2") {
            planChoice = {
                plan_name: "Platinum",
                price: "$50/month",
                description: "Optimal for business and large-scale projects that require high volume file transfers."
            };
        }

        $.ajax({
            url: '/api/post/pricing',
            type: 'POST',
            data: JSON.stringify(planChoice),
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            contentType: 'application/json',
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    console.log('redirecting to confirmation...');
                    window.location.href = './confirmation.html';
                } else {
                    console.log('error:', response.message);
                    alert(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.log('error:', error);
            }
        });
    });
}

// retrieving local storage from signup.js
function getUserBin() {
    const firstname = localStorage.getItem("firstname");
    const email = localStorage.getItem("email");
    return {
        firstname: firstname, email: email
    };
}



function send_mail(){        
    const userData = getUserBin();
    const selectedPlan = $("input[name='uo']:checked").val();
    let plan_name = "";
    if (selectedPlan === "0") {
        plan_name = "Silver";
    } else if (selectedPlan === "1") {
        plan_name = "Gold";
    } else if (selectedPlan === "2") {
        plan_name = "Platinum";
    }
    fetch('/api/post/send_mail/', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: userData.email,
            firstname: userData.firstname,
            plan_name: plan_name
        })
    })
    .then(response => response.json())
    .then(data => {alert(data.message || data.error);})
    .catch(error => console.error('error: ', error));
};

// export functions to be used in testing
module.exports = {
    validatePlan,
    getCookie,
    setupPricingPage
};
