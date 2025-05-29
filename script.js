document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll check (already handled by CSS, but good to be aware)
    console.log("CSS smooth scroll should be active.");

    // Scroll Reveal for Sections
    const sections = document.querySelectorAll('section:not(#hero)'); // Exclude hero as it's visible initially

    const sectionObserverOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Optional: stop observing once visible
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        section.classList.add('reveal-on-scroll'); // Initial state for CSS
        sectionObserver.observe(section);
    });

    // Dynamic year in footer (if not hardcoded) - Worker already hardcoded it, so this is optional
    // const yearSpan = document.getElementById('current-year');
    // if (yearSpan) {
    //   yearSpan.textContent = new Date().getFullYear();
    // }

    // Custom Cursor Logic
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorOutline = document.querySelector('.custom-cursor-outline');

    if (cursorDot && cursorOutline) { // Check if elements exist
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with a slight delay using a more direct update
            // For a more pronounced delay, you might use requestAnimationFrame and lerping
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        });

        // Add hover effect for links and buttons
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .experience-card, .skill-tag'); // Add other selectors as needed
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    } else {
        console.log("Custom cursor elements not found. Skipping cursor script.");
        // Restore default cursor if custom elements are missing and not on small screen
        if (window.innerWidth > 768) {
             document.body.style.cursor = 'auto';
        }
    }

    // Generative Hero Background
    const canvas = document.getElementById('hero-canvas-background');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 100 }; // Mouse influence radius

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        // resizeCanvas(); // Initial size is called in initParticles after first resize

        // Particle class
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1; // Particle size
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                const particleColors = ['#FF6B6B', '#4ECDC4'];
                this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
                this.alpha = Math.random() * 0.3 + 0.1; // More transparent particles
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1; // Reset globalAlpha
            }

            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance; // The closer the particle, the stronger the force
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius && mouse.x !== null) { // Check mouse.x to ensure mouse is over canvas
                    this.x -= directionX * 0.5; // Adjust multiplier for sensitivity
                    this.y -= directionY * 0.5;
                } else {
                    if (this.x !== this.baseX) {
                        let dxToBase = this.x - this.baseX;
                        this.x -= dxToBase / 20; // Return to base position faster
                    }
                    if (this.y !== this.baseY) {
                        let dyToBase = this.y - this.baseY;
                        this.y -= dyToBase / 20;
                    }
                }
                // this.draw(); // Drawing is now handled in animateParticles loop
            }
        }

        function initParticles() {
            particles = [];
            // Ensure canvas has dimensions before calculating number of particles
            if (canvas.width === 0 || canvas.height === 0) resizeCanvas(); 
            
            const numberOfParticles = Math.min(100, Math.floor(canvas.width * canvas.height / 20000) ); // Adjust density
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        }
        // initParticles(); // Called by resize event listener first

        // Update mouse position
        canvas.addEventListener('mousemove', (event) => {
            mouse.x = event.offsetX;
            mouse.y = event.offsetY;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        // Re-initialize particles on resize to adjust density
        window.addEventListener('resize', () => {
            resizeCanvas(); // This will set canvas.width and canvas.height
            initParticles(); // Re-evaluate number of particles
        });
        
        // Initial setup
        resizeCanvas(); // Set initial size
        initParticles(); // Create initial particles

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw(); // Draw particle after updating
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

    } else {
        console.log("Hero canvas element not found.");
    }
});
