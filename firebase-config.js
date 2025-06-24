// =========================
// Firebase Configuration
// Contains your web app's Firebase project settings
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyA2gh45iMXdtcs56IIOCiy2p8VsQIjAgxo",
  authDomain: "rebelkik-blog.firebaseapp.com",
  projectId: "rebelkik-blog",
  storageBucket: "rebelkik-blog.firebasestorage.app",
  messagingSenderId: "406596264309",
  appId: "1:406596264309:web:8fc979c03375fc6eb5b33c"
};

// =========================
// Initialize Firebase App
// =========================
firebase.initializeApp(firebaseConfig);

console.log("Firebase initialized");