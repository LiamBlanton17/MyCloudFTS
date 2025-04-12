document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

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