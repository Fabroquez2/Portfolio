import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const navIcons = document.querySelectorAll('.nav-icon');
navIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        navIcons.forEach(i => i.classList.remove('active'));
        icon.classList.add('active');
    });
});

// Smooth scrolling for sidebar links
document.querySelectorAll('.sidebar-menu a').forEach(anchor => {
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
