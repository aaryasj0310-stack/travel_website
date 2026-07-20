(function () {
    const reveals = document.querySelectorAll(".reveal");

    if (!reveals.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        reveals.forEach((reveal) => reveal.classList.add("active"));
        return;
    }

    const revealOnScroll = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.15 }
    );

    reveals.forEach((reveal) => revealOnScroll.observe(reveal));
})();
