// darkMode.js

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('mode-toggle');
    const darkModeStyle = document.getElementById('dark-mode-style');
    const htmlElement = document.documentElement; // The <html> tag

    // --- Core Toggle Function ---
    function toggleDarkMode(isDarkMode) {
        if (isDarkMode) {
            // 1. Apply dark class to HTML element for CSS targeting
            htmlElement.classList.add('dark-mode');
            // 2. Enable the separate dark mode stylesheet
            darkModeStyle.disabled = false;
            // 3. Update button text
            toggleButton.textContent = 'Switch to Light Mode ☀️';
            // 4. Save preference
            localStorage.setItem('theme', 'dark');
        } else {
            // 1. Remove dark class
            htmlElement.classList.remove('dark-mode');
            // 2. Disable the separate dark mode stylesheet (reverts to main style.css)
            darkModeStyle.disabled = true;
            // 3. Update button text
            toggleButton.textContent = 'Switch to Dark Mode 🌙';
            // 4. Save preference
            localStorage.setItem('theme', 'light');
        }
    }

    // --- Load Saved Preference on Page Load ---
    const savedTheme = localStorage.getItem('theme');
    
    // Check if a preference is saved, otherwise check system preference
    if (savedTheme === 'dark') {
        toggleDarkMode(true);
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If no preference is saved, respect the user's system setting (optional)
        toggleDarkMode(true);
    } else {
        // Default to light mode
        toggleDarkMode(false);
    }

    // --- Event Listener for Button Click ---
    toggleButton.addEventListener('click', () => {
        // Check current state (we can rely on the class presence)
        const currentlyDark = htmlElement.classList.contains('dark-mode');
        // Toggle to the opposite mode
        toggleDarkMode(!currentlyDark);
    });
});