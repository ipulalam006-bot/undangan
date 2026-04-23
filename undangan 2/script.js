// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. State & Elements
let isMusicPlaying = false;
const audio = document.getElementById('bg-music');
const loader = document.getElementById('loader');
const gate = document.getElementById('gate');
const mainContent = document.getElementById('main-content');
const musicContainer = document.getElementById('music-container');
const volumeControl = document.getElementById('volume-control');
const volumeVal = document.getElementById('volume-val');

// 3. Loading Screen
window.addEventListener('load', () => {
    // Initialize AOS early to handle gate animations
    AOS.init({ 
        duration: 1200, 
        once: true,
        mirror: false
    });
    
    // Refresh Lucide icons for any dynamic content
    lucide.createIcons();

    setTimeout(() => {
        gsap.to(loader, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                loader.style.display = 'none';
                lenis.stop(); // Stop scroll until gate is opened
            }
        });
    }, 2000);
});

// 4. Custom Cursor
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.5, ease: "power2.out" });
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
});

document.querySelectorAll('button, a, input, select, textarea, .cursor-pointer').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
});

// 5. URL Parameter Handling
const urlParams = new URLSearchParams(window.location.search);
const toParam = urlParams.get('to');
if (toParam) {
    document.getElementById('guest-name').textContent = toParam;
}

// 6. Music & Volume Logic
function toggleMusic() {
    const musicOn = document.querySelector('.music-on');
    const musicOff = document.querySelector('.music-off');
    
    if (isMusicPlaying) {
        audio.pause();
        musicOn.classList.add('hidden');
        musicOff.classList.remove('hidden');
    } else {
        audio.play().catch(e => console.log("Autoplay prevented"));
        musicOn.classList.remove('hidden');
        musicOff.classList.add('hidden');
    }
    isMusicPlaying = !isMusicPlaying;
}

document.getElementById('music-toggle').addEventListener('click', toggleMusic);

volumeControl.addEventListener('input', (e) => {
    const val = e.target.value;
    audio.volume = val;
    volumeVal.textContent = Math.round(val * 100) + "%";
});

// 7. Open Invitation
document.getElementById('open-invitation').addEventListener('click', () => {
    // Start music
    audio.play().catch(e => console.log("Autoplay prevented"));
    isMusicPlaying = true;
    audio.volume = 0.7;

    // Confetti
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#8b5cf6']
    });

    // Animate Gate Out
    gsap.to(gate, {
        y: '-100%',
        duration: 2,
        ease: "expo.inOut",
        onComplete: () => {
            gate.style.display = 'none';
            lenis.start(); // Allow scrolling
            initHeroParticles();
        }
    });

    // Reveal Main Content
    mainContent.classList.remove('hidden');
    gsap.to(mainContent, { opacity: 1, duration: 1, delay: 0.5 });
    
    // Show Music Control
    gsap.to(musicContainer, { y: 0, opacity: 1, duration: 1, delay: 1, ease: "back.out(1.7)" });
});

// 8. Dark Mode
const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    lucide.createIcons();
});

if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}

// 9. Hero Particles (Canvas 2D)
function initHeroParticles() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('hero-particles');
    container.appendChild(canvas);

    let particles = [];
    const particleCount = window.innerWidth < 768 ? 30 : 60;

    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.alpha = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

// 10. Countdown Timer
const targetDate = new Date("April 23, 2026 09:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(d).padStart(2, '0');
    document.getElementById('hours').textContent = String(h).padStart(2, '0');
    document.getElementById('minutes').textContent = String(m).padStart(2, '0');
    document.getElementById('seconds').textContent = String(s).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// 11. RSVP & Guestbook Advanced
const rsvpForm = document.getElementById('rsvp-form');
const wishesList = document.getElementById('wishes-list');

function loadWishes() {
    const wishes = JSON.parse(localStorage.getItem('premium_wishes') || '[]');
    let attendingCount = 0;
    
    wishesList.innerHTML = wishes.map(wish => {
        if (wish.status === 'Hadir') attendingCount += parseInt(wish.count || 1);
        return `
            <div class="wish-item glass p-6 rounded-3xl border border-primary/5 hover:border-primary/20 transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h5 class="font-bold text-lg text-primary">${wish.name}</h5>
                        <p class="text-[10px] text-gray-400 uppercase tracking-widest">${wish.date}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold ${wish.status === 'Hadir' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} uppercase">${wish.status}</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 italic leading-relaxed">"${wish.message}"</p>
            </div>
        `;
    }).reverse().join('');

    document.getElementById('total-attending').textContent = attendingCount + " Tamu";
    document.getElementById('total-wishes').textContent = wishes.length + " Ucapan";
}

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const wish = {
        name: document.getElementById('rsvp-name').value,
        status: document.getElementById('rsvp-status').value,
        count: document.getElementById('rsvp-count').value,
        message: document.getElementById('rsvp-message').value,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const wishes = JSON.parse(localStorage.getItem('premium_wishes') || '[]');
    wishes.push(wish);
    localStorage.setItem('premium_wishes', JSON.stringify(wishes));
    
    rsvpForm.reset();
    loadWishes();
    
    confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#ec4899']
    });
});

loadWishes();

// 12. Digital Gift Features (Copy & QR)
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(text).then(() => {
            const original = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> Berhasil Salin!';
            btn.classList.add('bg-green-500', 'text-white');
            setTimeout(() => {
                btn.innerHTML = original;
                btn.classList.remove('bg-green-500', 'text-white');
                lucide.createIcons();
            }, 2000);
        });
    });
});

const qrModal = document.getElementById('qr-modal');
const qrcodeContainer = document.getElementById('qrcode');
document.querySelectorAll('.qr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-value');
        const [name, acc] = val.split('|');
        document.getElementById('qr-title').textContent = "QR Transfer " + name;
        qrcodeContainer.innerHTML = '';
        new QRCode(qrcodeContainer, {
            text: acc,
            width: 200,
            height: 200,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        qrModal.classList.remove('hidden');
        qrModal.classList.add('active');
        lenis.stop();
    });
});

document.getElementById('close-qr').addEventListener('click', () => {
    qrModal.classList.add('hidden');
    qrModal.classList.remove('active');
    lenis.start();
});

// 13. Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
document.querySelectorAll('#gallery-grid > div').forEach(item => {
    item.addEventListener('click', () => {
        lightboxImg.src = item.querySelector('img').src;
        lightbox.classList.remove('hidden');
        lenis.stop();
    });
});

document.getElementById('close-lightbox').addEventListener('click', () => {
    lightbox.classList.add('hidden');
    lenis.start();
});

// 14. Scroll Progress
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scroll-progress').style.width = scrolled + "%";
});

// Initialize Lucide
lucide.createIcons();
