// =========================
// Firebase Auth Reference
// =========================
const auth = firebase.auth();

// =========================
// Signup Handler
// Handles user registration
// =========================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signupForm['email'].value;
    const password = signupForm['password'].value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        alert("Signup successful!");
        window.location.href = "blog.html";
      })
      .catch((error) => {
        alert("Signup error: " + error.message);
      });
  });
}

// =========================
// Login Handler
// Handles user login
// =========================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        alert("Login successful!");
        window.location.href = "blog.html";
      })
      .catch((error) => {
        alert("Login error: " + error.message);
      });
  });
}

// =========================
// Logout Handler
// Handles user logout
// =========================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut()
      .then(() => {
        alert("Logged out successfully!");
        window.location.href = 'index.html';  // redirect to home or login page
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Error logging out: " + error.message);
      });
  });
}

// =========================
// Auth State Protection
// Redirects unauthenticated users to login page
// =========================
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // If not on login or signup page, redirect to login
    if (
      !window.location.pathname.includes('login.html') &&
      !window.location.pathname.includes('signup.html')
    ) {
      window.location.href = 'login.html';
    }
  }
});
