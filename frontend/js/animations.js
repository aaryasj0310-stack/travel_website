(function () {
    if (typeof window.matchMedia !== "function") {
        return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncMotionPreference() {
        document.documentElement.classList.toggle("reduced-motion", reducedMotionQuery.matches);
    }

    syncMotionPreference();

    if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", syncMotionPreference);
    } else if (typeof reducedMotionQuery.addListener === "function") {
        reducedMotionQuery.addListener(syncMotionPreference);
    }
})();
