document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // Test Here 
    // Function to get CSRF token - Move to utils folder for repeated use
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

    const logoutBtn = document.querySelector(".logout a");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
          e.preventDefault();
          fetch("/api/post/logout/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"),
            },
            credentials: "same-origin", // important if user is logged in
          })
            .then((response) => {
              if (response.ok) {
                window.location.href = "/login.html";
              } else {
                console.error("Logout failed: ", response.statusText);
              }
            })
            .catch((error) => {
              console.error("Logout error:", error);
            });
        });
      }
    // Test End

    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Update tab button states
        tabButtons.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        });
        tabContents.forEach((content) =>
          content.classList.remove("active")
        );

        // Activate selected tab
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");
        const tabName = this.getAttribute("data-tab");
        document.getElementById(`${tabName}-tab`).classList.add("active");
      });
    });

    // Handle form submissions
    const securityForm = document.querySelector(".security-form");
    if (securityForm) {
      securityForm.addEventListener("submit", function (e) {
        e.preventDefault();
        // Add password update logic here
        alert("Password update functionality will be implemented soon");
      });
    }

    // Handle toggle switches
    const toggleSwitches = document.querySelectorAll(
      '.switch input[type="checkbox"]'
    );
    toggleSwitches.forEach((toggle) => {
      toggle.addEventListener("change", function () {
        const setting =
          this.closest(".toggle-option").querySelector("span").textContent;
        // Add toggle update logic here
        console.log(
          `${setting} is now ${this.checked ? "enabled" : "disabled"}`
        );
      });
    });

    // Handle language selection
    const languageSelect = document.querySelector(
      ".language-section select"
    );
    if (languageSelect) {
      languageSelect.addEventListener("change", function () {
        // Add language update logic here
        console.log(`Language changed to ${this.value}`);
      });
    }
});