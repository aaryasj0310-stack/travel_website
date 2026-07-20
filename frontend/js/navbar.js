(function () {
    const navbar = document.getElementById("navbar");

    if (!navbar) {
        return;
    }

    function updateNavbarState() {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    }

    updateNavbarState();
    window.addEventListener("scroll", updateNavbarState, { passive: true });
})();
