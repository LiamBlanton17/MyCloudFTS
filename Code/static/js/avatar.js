/**
 * Avatar Component JavaScript
 * Ensures consistent circular avatars across browsers
 */

document.addEventListener('DOMContentLoaded', function() {
  // Force perfect circles by setting equal width and height
  const avatars = document.querySelectorAll('.avatar');
  
  avatars.forEach(avatar => {
    // Ensure perfect circle by making sure width = height
    const size = Math.max(
      parseInt(window.getComputedStyle(avatar).width, 10),
      parseInt(window.getComputedStyle(avatar).height, 10)
    );
    
    avatar.style.width = `${size}px`;
    avatar.style.height = `${size}px`;
    
    // Ensure text is centered
    avatar.style.lineHeight = `${size}px`;
    avatar.style.textAlign = 'center';
    
    // Force border-radius to be 50% of the size
    avatar.style.borderRadius = '50%';
  });
  
  // Avatar color picker functionality
  const colorOptions = document.querySelectorAll('.color-option');
  const saveColorButton = document.getElementById('save-avatar-color');
  const avatarPreview = document.querySelector('.avatar-preview .avatar');
  const customColorInput = document.getElementById('custom-color');
  const customColorPreview = document.getElementById('custom-color-preview');
  let selectedColor = null;
  
  // Initialize the currently selected color option based on current avatar color
  if (avatarPreview && colorOptions.length > 0) {
    const currentColor = window.getComputedStyle(avatarPreview).backgroundColor;
    
    // Convert RGB to HSL for better comparison with our HSL colors
    let rgbValues = currentColor.match(/\d+/g);
    if (rgbValues && rgbValues.length >= 3) {
      const r = rgbValues[0] / 255;
      const g = rgbValues[1] / 255;
      const b = rgbValues[2] / 255;
      
      // Find the closest match among our color options
      colorOptions.forEach(option => {
        const optionColor = option.getAttribute('data-color');
        const optionBgColor = window.getComputedStyle(option).backgroundColor;
        
        if (optionBgColor === currentColor || optionColor === currentColor) {
          option.classList.add('selected');
          selectedColor = optionColor;
        }
      });
    }
    
    // If no match found, set the custom color input value
    if (!selectedColor && customColorInput) {
      // Try to convert RGB to hex for the color input
      if (rgbValues && rgbValues.length >= 3) {
        try {
          const hexColor = rgbToHex(parseInt(rgbValues[0]), parseInt(rgbValues[1]), parseInt(rgbValues[2]));
          customColorInput.value = hexColor;
          customColorPreview.style.backgroundColor = hexColor;
          customColorPreview.setAttribute('data-color', hexColor);
          selectedColor = hexColor;
        } catch (e) {
          console.error('Error converting RGB to hex:', e);
        }
      }
    }
  }
  
  // Handle color option selection
  if (colorOptions) {
    colorOptions.forEach(option => {
      option.addEventListener('click', function() {
        if (this.id === 'custom-color-preview') {
          return; // Skip handling for the custom preview button
        }
        
        // Remove selected class from all options
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Update selected color
        selectedColor = this.getAttribute('data-color');
        
        // Update avatar preview
        if (avatarPreview) {
          avatarPreview.style.backgroundColor = selectedColor;
        }
      });
    });
  }
  
  // Handle custom color input changes
  if (customColorInput && customColorPreview) {
    customColorInput.addEventListener('input', function() {
      const newColor = this.value;
      
      // Update custom color preview
      customColorPreview.style.backgroundColor = newColor;
      customColorPreview.setAttribute('data-color', newColor);
      
      // Remove selected class from predefined options
      colorOptions.forEach(opt => {
        if (opt.id !== 'custom-color-preview') {
          opt.classList.remove('selected');
        }
      });
      
      // Make custom preview selected
      customColorPreview.classList.add('selected');
      
      // Update selected color
      selectedColor = newColor;
      
      // Update avatar preview
      if (avatarPreview) {
        avatarPreview.style.backgroundColor = newColor;
      }
    });
  }
  
  // Handle save color button click
  if (saveColorButton) {
    saveColorButton.addEventListener('click', function() {
      if (selectedColor) {
        // Save the selected color to user preferences using AJAX
        fetch('/api/post/update_avatar_color/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
          body: JSON.stringify({
            avatar_color: selectedColor
          })
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to save avatar color');
        })
        .then(data => {
          // Show success message
          alert('Avatar color saved successfully!');
          
          // Update all avatars with the new color
          document.querySelectorAll('.avatar').forEach(avatar => {
            avatar.style.backgroundColor = selectedColor;
          });
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to save avatar color. Please try again.');
        });
      } else {
        alert('Please select a color first');
      }
    });
  }
  
  // Helper function to get CSRF token from cookies
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
  
  // Helper function to convert RGB to HEX
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');
  }
});