// Toggle Navigation for Mobile
function toggleNav() {
    const navbarLinks = document.getElementById('navbarLinks');
    navbarLinks.classList.toggle('active'); // Toggle the 'active' class
}

// Fade-in Animation on Scroll
document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.item'); // Select all elements with the class 'item'
    const observerOptions = { threshold: 0.1 }; // Trigger animation when 10% of the element is visible

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply fade-in animation
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Stop observing after animation
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    items.forEach(item => {
        // Set initial styles for the animation
        item.style.opacity = 0;
        item.style.transform = 'translateY(20px)';
        observer.observe(item); // Start observing each item
    });
});
