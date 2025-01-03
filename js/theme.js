// Theme switcher functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference, default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme on load
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Toggle theme
    themeToggle.addEventListener('click', () => {
        let theme = 'light';
        
        if (!document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.setAttribute('data-theme', 'dark');
            theme = 'dark';
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
        
        // Add animation class
        themeToggle.classList.add('theme-toggle-spin');
        setTimeout(() => {
            themeToggle.classList.remove('theme-toggle-spin');
        }, 500);
    });
});
