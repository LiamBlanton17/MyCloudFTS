$(() => {
    // 2FA Auth
    const auth2faBtn = $("#2fa-toggle");
    auth2faBtn.on("click", function(e){
      e.preventDefault();
      $.ajax({
          url: '/api/post/login/toggle_2fa/',
          type: 'POST',
          headers: {
              'X-CSRFToken': getCookie('csrftoken')
          },
          contentType: 'application/json',
          dataType: 'json',
          success: function(response) {
              console.log('Success:', response);
              if (response.status === 'success') {
                toggleAuth2FA(response.auth2fa_status);
              } else {
                console.log('Error:', response.message);
                alert(`Failed: ${response.message}`);
              }
          },
          error: function(xhr, status, error) {
              console.log('Error:', error);
              alert('Failed to toggle 2fa. Server error.');
          }
      });
    });

    // Toggle theme functionality
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document
          .querySelectorAll(".theme-btn")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        // Here you would implement actual theme switching logic
      });
    });

    // Handle modal for personal information
    const personalInfoBtn = document.querySelector(
      ".settings-item:nth-child(1) .settings-btn"
    );
    const personalInfoModal = document.getElementById("personalInfoModal");
    const closePersonalInfo = personalInfoModal.querySelector(".close");

    personalInfoBtn.addEventListener("click", function () {
      personalInfoModal.style.display = "block";
    });

    closePersonalInfo.addEventListener("click", function () {
      personalInfoModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
      if (event.target == personalInfoModal) {
        personalInfoModal.style.display = "none";
      }
    });

    // Handle update personal information form submission
    document
      .getElementById("personalInfoForm")
      .addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent the default form submission

        const first_name = document.getElementById("firstName").value;
        const last_name = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;

        fetch("/api/post/update_personal_info/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"), // Include CSRF token
          },
          body: JSON.stringify({
            first_name: first_name,
            last_name: last_name,
            email: email,
          }),
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Failed to update personal information.");
            }
          })
          .then((data) => {
            alert(data.message); // Show success message
            personalInfoModal.style.display = "none"; // Close the modal
            location.reload(); // Reload the page to reflect changes
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while updating your information.");
          });
      });

    // Handle logout
    document.querySelector(".logout").addEventListener("click", function (e) {
      e.preventDefault();
      fetch("/api/post/logout/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/login.html";
          }
        })
        .catch((error) => {
          console.error("Logout failed:", error);
        });
    });

    // Function to get CSRF token
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
    function toggleAuth2FA(isOn){
      if(isOn){
        $("#2fa-toggle").html('Turn Off');
      } else{
        $("#2fa-toggle").html('Turn On');
      }
    }
    // Set the 2FA Auth button to the correct one.
    const starting_auth2fa_status = "{{ auth2fa_status }}";
    console.log(starting_auth2fa_status);
    toggleAuth2FA(starting_auth2fa_status === "True");
  });