// Shrink the Navbar and the logo when the user scrolls down.
window.addEventListener("scroll", function () {
    const navbar = document.querySelector("nav");
    const navbarLogo = document.querySelector("nav .logo img");
    const mobileMenu = document.querySelector("nav .menu");
    const mobileSocial = document.querySelector("nav .social-icons");
    if (window.scrollY > 30) {
        navbar.classList.add("shrink");
        navbarLogo.classList.add("shrink");
        mobileMenu.classList.add("shrink");
        mobileSocial.classList.add("shrink");
    } else {
        navbar.classList.remove("shrink");
        navbarLogo.classList.remove("shrink");
        setTimeout(function () {
            mobileMenu.classList.remove("shrink");
            mobileSocial.classList.remove("shrink");
        }, 100);
    }
});

// Toggle the mobile menu when the hamburger icon is clicked.
const toggleButton = document.querySelector("nav .toggle-box");
toggleButton.addEventListener("click", function () {
    const navbar = document.querySelector(".navbar");
    const toggleBars = document.querySelector("nav .toggle");
    const mobileMenu = document.querySelector("nav .menu");
    const mobileSocial = document.querySelector("nav .social-icons");
    toggleBars.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    mobileSocial.classList.toggle("active");
    navbar.classList.toggle("transparent");
});