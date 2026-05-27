import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== Burger / Drawer Menu =====
const burgerBtn = document.getElementById('burgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerClose = document.getElementById('drawerClose');

function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('visible');
    burgerBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('visible');
    burgerBtn.classList.remove('open');
    document.body.style.overflow = '';
}

if (burgerBtn) burgerBtn.addEventListener('click', openDrawer);
if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

// Close drawer when a link inside is clicked
document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
});

// ===== Dark Mode =====
const darkModeBtn = document.getElementById('darkModeBtn');
const darkModeIcon = document.getElementById('darkModeIcon');
const darkModeDrawerToggle = document.getElementById('darkModeDrawerToggle');

function setDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
        if (darkModeIcon) { darkModeIcon.classList.remove('fa-moon'); darkModeIcon.classList.add('fa-sun'); }
        if (darkModeDrawerToggle) darkModeDrawerToggle.checked = true;
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        if (darkModeIcon) { darkModeIcon.classList.remove('fa-sun'); darkModeIcon.classList.add('fa-moon'); }
        if (darkModeDrawerToggle) darkModeDrawerToggle.checked = false;
        localStorage.setItem('darkMode', 'false');
    }
}

// Load saved preference on page load
if (localStorage.getItem('darkMode') === 'true') setDarkMode(true);

// Navbar moon/sun button
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
        setDarkMode(!document.body.classList.contains('dark-mode'));
    });
}

// Drawer toggle switch
if (darkModeDrawerToggle) {
    darkModeDrawerToggle.addEventListener('change', () => {
        setDarkMode(darkModeDrawerToggle.checked);
    });
}



// TODO: Replace with your actual Firebase project configuration from your Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Navigation Active State Handling
const navIcons = document.querySelectorAll('.nav-icon, .mobile-nav-icon');
navIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        navIcons.forEach(i => i.classList.remove('active'));
        icon.classList.add('active');
        
        // Also sync the desktop and mobile nav active states if needed
        const href = icon.getAttribute('href');
        document.querySelectorAll(`a[href="${href}"]`).forEach(link => {
            link.classList.add('active');
        });
    });
});

// Smooth scrolling for sidebar and nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
        // Save to Firestore 'contacts' collection
        await addDoc(collection(db, "contacts"), {
            name: name,
            email: email,
            message: message,
            timestamp: new Date()
        });
        
        formMessage.textContent = "Message sent successfully! I'll get back to you soon.";
        formMessage.className = "form-message success";
        contactForm.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        formMessage.textContent = "Error sending message. Please configure Firebase credentials in app.js.";
        formMessage.className = "form-message error";
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        setTimeout(() => {
            formMessage.textContent = "";
            formMessage.className = "form-message";
        }, 5000);
    }
});

// Cover Photo Carousel Logic
const slides = document.querySelectorAll('#coverPhotoSlider .slide');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');
let currentSlide = 0;
let slideInterval;

// CUSTOMIZE_SLIDER: Set the autoplay duration for image slides (in milliseconds)
const imageSlideDuration = 5000;

function showSlide(index) {
    // Clear any active autoplay timer when we change slides
    clearInterval(slideInterval);

    // Pause the previous slide if it was a video
    const prevSlideEl = slides[currentSlide];
    if (prevSlideEl && prevSlideEl.tagName === 'VIDEO') {
        prevSlideEl.pause();
        prevSlideEl.onended = null; // Clear listener
    }

    slides[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    const activeSlide = slides[currentSlide];
    activeSlide.classList.add('active');

    // Handle video slides versus image slides
    if (activeSlide && activeSlide.tagName === 'VIDEO') {
        activeSlide.currentTime = 0;
        activeSlide.play().catch(err => {
            console.log("Autoplay of video slide prevented or interrupted. Make sure video is muted:", err);
        });

        // When the video ends, automatically move to the next slide
        activeSlide.onended = () => {
            nextSlide();
        };
    } else {
        // For normal image slides, resume the normal slideshow interval timer
        slideInterval = setInterval(nextSlide, imageSlideDuration);
    }
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }

if (slides.length > 0) {
    // Start initial state
    const firstSlide = slides[0];
    if (firstSlide && firstSlide.tagName === 'VIDEO') {
        firstSlide.currentTime = 0;
        firstSlide.play().catch(err => console.log(err));
        firstSlide.onended = () => {
            nextSlide();
        };
    } else {
        slideInterval = setInterval(nextSlide, imageSlideDuration);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
        });
    }
}

// ===== Scroll Animation Observer =====
const animateItems = document.querySelectorAll('.animate-on-scroll');

if ('IntersectionObserver' in window && animateItems.length > 0) {
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animateItems.forEach(item => {
        scrollObserver.observe(item);
    });
} else {
    // Fallback if IntersectionObserver is not supported
    animateItems.forEach(item => {
        item.classList.add('active');
    });
}

// ===== Project Details Modal Database & Interactivity =====
// CUSTOMIZE_CONTENT: Customize or add your real projects below.
// How to add/modify projects:
// 1. Each project is an object key (e.g. "swiftcart"). This key MUST match the 'data-project-id' attribute on the card in public/index.html.
// 2. title: Project name displayed inside the fullscreen details modal.
// 3. desc: Paragraph describing the project's background, core features, architecture, and technology.
// 4. tags: Array of technical skills and frameworks (e.g. ["React", "CSS"]).
// 5. images: Array of project image paths/links (e.g. ["images/projects/project-home.png"]) shown in the modal gallery.
// 6. live: (Optional) Link to the active deployment.
// 7. source: (Optional) Link to the GitHub code repository.
const projectsData = {

    swiftcart: {
        title: "Campus Chat Local Messaging System",
        desc: "Campus Chat is a locally hosted messaging system designed for internal communication within a campus network. It operates exclusively on the local access point (AP), allowing users to connect and chat securely without internet dependency.\n\nAs part of the development team, I worked as a tester and bug hunter, focusing on identifying system flaws, verifying message delivery stability, and ensuring smooth connectivity between devices. My role helped improve the system’s reliability and user experience during local deployment.",
        tags: ["Browser DevTools", "Manual Exploratory Testing", "Error Logging Tools"],
        images: [
            // CUSTOMIZE_IMAGE: Replace the project image URLs below with your own files/links
            "./images/project-1.jpg",
            "./images/project-1-1.jpg",
            "./images/project-1-2.jpg",
        ],
        live: "#",
        source: "#"
    },
    devanalytics: {
        title: "Motorcycle Parts and Accessories Management System",
        desc: " The Motorcycle Parts and Accessories Management System is designed to streamline inventory tracking, product cataloging, and customer transactions for motorcycle shops. It provides a centralized platform to manage parts, accessories, and sales records efficiently.",
        tags: ["HTML", "CSS", "JavaScript "],
        images: [
            // CUSTOMIZE_IMAGE: Replace the project image URLs below with your own files/links
            "./images/project-a-1.jpg",
            "./images/project-a-2.jpg",
        ],
        live: "#",
        source: "#"
    },
    smartchat: {
        title: "Water Refilling Station Management System",
        desc: "The Water Refilling Station Management System is designed to simplify operations at water refilling stations. It provides features for managing station inventory, tracking usage, and facilitating customer transactions.",
        tags: ["HTML", "CSS", "JavaScript"],
        images: [
            // CUSTOMIZE_IMAGE: Replace the project image URLs below with your own files/links
            "./images/project-b-1.jpg",
            "./images/project-b-2.jpg",
        ],
        live: "#",
        source: "#"
    },

};

// ===== Certificates Data Database =====
// CUSTOMIZE_CONTENT: Customize or add your real certificates below.
// How to add/modify credentials:
// 1. Each certificate is an object key (e.g. "meta-frontend"). This key MUST match the 'data-cert-id' attribute on the card in public/index.html.
// 2. title: The full certificate name displayed inside the details modal.
// 3. desc: Description of skills, credentials, and courses covered by the certificate.
// 4. tags: Array of technical skills validated by the certificate (e.g. ["React", "Git"]).
// 5. images: Array of certificate image paths/links (e.g. ["images/certs/my-certificate.png"]) shown in the modal gallery.
// 6. verifyLink: The URL where visitors can verify the certificate credential.
const certsData = {

    "meta-frontend": {
        title: "Advanced Seminar Series",
        desc: " Journey from Science Practitioner to Information Technology Specialist ",
        tags: ["Seminar"],
        images: [
            "./images/cert-1.png"
        ],
    },
    "aws-cloud": {
        title: "Advanced Seminar Series",
        desc: " The Power of Color in Graphic Design: Theory, Physchology, and Practice",
        tags: ["Seminar"],
        images: [
            "./images/cert-2.png"
        ],
    },
    "google-it": {
        title: "Introduction to Packet Tracer",
        desc: "Cisco Academy Course",
        tags: ["Cisco"],
        images: [
            "./images/cert-3.png"
        ],
    },
    "freecodecamp-fullstack": {
        title: "Ethical Hacker",
        desc: "Cisco Academy Course",
        tags: ["Cisco"],
        images: [
            "./images/cert-4.png"
        ],
    },
    "scrummaster": {
        title: "Certificate Of Participation",
        desc: "Showcasing Startup Project During the Level App 2.0",
        tags: ["LevelApp 2.0"],
        images: [
            "./images/cert-5.jpeg"
        ],
    },
    "oracle-java": {
        title: "Tree Planting Certificate",
        desc: "Certificate ",
        tags: ["Gcash"],
        images: [
            "./images/cert-6.png"
        ],
    },

        "oracle2-java": {
        title: "Certificate Of Participation",
        desc: "PAGHIUSA SA LENTE MULTIMEDIA FESTIVAL 2022.",
        tags: ["DNSC"],
        images: [
            "./images/cert-7.jpg"
        ],
    }

};

const projectModal = document.getElementById('projectModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalMainImg = document.getElementById('modalMainImg');
const modalPrevBtn = document.getElementById('modalPrevBtn');
const modalNextBtn = document.getElementById('modalNextBtn');
const modalThumbs = document.getElementById('modalThumbs');
const modalProjTitle = document.getElementById('modalProjTitle');
const modalProjTags = document.getElementById('modalProjTags');
const modalProjDesc = document.getElementById('modalProjDesc');
const modalPrevProjectBtn = document.getElementById('modalPrevProjectBtn');

const modalNextProjectBtn = document.getElementById('modalNextProjectBtn');



let currentProjImages = [];
let currentImgIndex = 0;
let currentActiveId = null;
let currentIsCert = false;

function openModal(id, isCert = false) {
    const data = isCert ? certsData[id] : projectsData[id];
    if (!data) return;

    currentActiveId = id;
    currentIsCert = isCert;
    currentProjImages = data.images;
    currentImgIndex = 0;

    // Populate details
    modalProjTitle.textContent = data.title;
    modalProjDesc.textContent = data.desc;

    // Adapt modal heading/labels dynamically based on type
    const subheading = projectModal.querySelector('.section-subheading');
    if (subheading) {
        subheading.textContent = isCert ? "About the Credential" : "About the Project";
    }




    // Tags
    modalProjTags.innerHTML = '';
    data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tech-tag';
        span.textContent = tag;
        modalProjTags.appendChild(span);
    });

    // Populate thumbnails
    modalThumbs.innerHTML = '';
    if (data.images.length > 1) {
        modalThumbs.style.display = 'flex';
        data.images.forEach((imgSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.alt = `${data.title} thumbnail ${index + 1}`;
            thumb.className = `modal-thumb ${index === 0 ? 'active' : ''}`;
            thumb.addEventListener('click', () => {
                currentImgIndex = index;
                updateModalImg();
            });
            modalThumbs.appendChild(thumb);
        });
    } else {
        modalThumbs.style.display = 'none';
    }

    // Show/hide arrows for image carousel
    if (data.images.length > 1) {
        if (modalPrevBtn) modalPrevBtn.style.display = 'flex';
        if (modalNextBtn) modalNextBtn.style.display = 'flex';
    } else {
        if (modalPrevBtn) modalPrevBtn.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';
    }

    // Show/hide modal navigation buttons (prev/next project or cert) based on DOM items count
    const selector = isCert ? '.cert-card' : '.project-card';
    const totalItems = document.querySelectorAll(selector).length;
    if (totalItems > 1) {
        if (modalPrevProjectBtn) modalPrevProjectBtn.style.display = 'flex';
        if (modalNextProjectBtn) modalNextProjectBtn.style.display = 'flex';
    } else {
        if (modalPrevProjectBtn) modalPrevProjectBtn.style.display = 'none';
        if (modalNextProjectBtn) modalNextProjectBtn.style.display = 'none';
    }

    // Load main image
    updateModalImg();

    // Show modal
    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function updateModalImg() {
    if (!modalMainImg) return;
    modalMainImg.style.opacity = '0';
    setTimeout(() => {
        modalMainImg.src = currentProjImages[currentImgIndex];
        modalMainImg.style.opacity = '1';
    }, 200);

    // Update active thumb
    const thumbs = modalThumbs.querySelectorAll('.modal-thumb');
    thumbs.forEach((t, index) => {
        if (index === currentImgIndex) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });
}

function closeProjModal() {
    projectModal.classList.remove('open');
    document.body.style.overflow = '';
}

function navigateModal(direction) {
    const selector = currentIsCert ? '.cert-card' : '.project-card';
    const attr = currentIsCert ? 'data-cert-id' : 'data-project-id';
    const items = Array.from(document.querySelectorAll(selector))
        .map(el => el.getAttribute(attr))
        .filter(Boolean);

    if (items.length <= 1) return;

    let currentIndex = items.indexOf(currentActiveId);
    if (currentIndex === -1) return;

    let nextIndex = (currentIndex + direction + items.length) % items.length;
    let nextId = items[nextIndex];
    openModal(nextId, currentIsCert);
}

// Event Listeners for Projects
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project-id');
        if (projectId) {
            openModal(projectId, false);
        }
    });
});


// Event Listeners for Certificates
document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('click', () => {
        const certId = card.getAttribute('data-cert-id');
        if (certId) {
            openModal(certId, true);
        }
    });
});

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeProjModal);

if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', () => {
        currentImgIndex = (currentImgIndex - 1 + currentProjImages.length) % currentProjImages.length;
        updateModalImg();
    });
}

if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => {
        currentImgIndex = (currentImgIndex + 1) % currentProjImages.length;
        updateModalImg();
    });
}

if (modalPrevProjectBtn) {
    modalPrevProjectBtn.addEventListener('click', () => {
        navigateModal(-1);
    });
}

if (modalNextProjectBtn) {
    modalNextProjectBtn.addEventListener('click', () => {
        navigateModal(1);
    });
}

// ===== Grid Feed Limiter Overlays =====
function setupGridOverlays() {
    // For Projects
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length > 4) {
        const remainingProjects = projectCards.length - 4; // count actual hidden items
        const fourthProject = projectCards[3];
        if (fourthProject) {
            // Check if overlay already exists to avoid duplication
            if (!fourthProject.querySelector('.grid-more-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'grid-more-overlay';
                overlay.innerHTML = `<span>+${remainingProjects}</span>`;
                fourthProject.appendChild(overlay);
            }
        }
    }

    // For Certificates
    const certCards = document.querySelectorAll('.cert-card');
    if (certCards.length > 4) {
        const remainingCerts = certCards.length - 4; // count actual hidden items
        const fourthCert = certCards[3];
        if (fourthCert) {
            // Check if overlay already exists to avoid duplication
            if (!fourthCert.querySelector('.grid-more-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'grid-more-overlay';
                overlay.innerHTML = `<span>+${remainingCerts}</span>`;
                fourthCert.appendChild(overlay);
            }
        }
    }
}

// Initialize overlays on load
setupGridOverlays();

// ===== Profile Picture Flip Interaction =====
const profileFlipper = document.getElementById('profileFlipper');
if (profileFlipper) {
    // Automatically flip profile picture from profile-1 to profile-2 after 3 seconds
    setTimeout(() => {
        profileFlipper.classList.add('flipped');
    }, 3000);

    // Toggle flip on click so users can click to see front and back profile photos
    profileFlipper.addEventListener('click', () => {
        profileFlipper.classList.toggle('flipped');
    });
}

