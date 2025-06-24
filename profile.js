// =========================
// Firebase Initialization
// =========================
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// =========================
// Auth State Check
// Redirects to login if not authenticated
// =========================
auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // =========================
  // User Data References
  // =========================
  const userRef = db.collection('users').doc(user.uid);
  const profilePhotoPreview = document.getElementById('profilePhotoPreview');

  // =========================
  // Load User Profile Data
  // =========================
  try {
    const doc = await userRef.get();
    if (doc.exists) {
      const data = doc.data();
      document.getElementById('usernameInput').value = data.username || '';
      document.getElementById('bioInput').value = data.bio || '';
      document.getElementById('locationInput').value = data.location || '';
      profilePhotoPreview.src = data.photoURL || 'default-avatar.png';
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }

  // =========================
  // Handle Profile Save
  // Updates user data and uploads photo if changed
  // =========================
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('usernameInput').value.trim();
    const bio = document.getElementById('bioInput').value.trim();
    const location = document.getElementById('locationInput').value.trim();
    const photoFile = document.getElementById('photoInput').files[0];

    let photoURL = profilePhotoPreview.src;

    // Upload new photo if selected
    if (photoFile) {
      const photoRef = storage.ref(`profiles/${user.uid}/photo.jpg`);
      await photoRef.put(photoFile);
      photoURL = await photoRef.getDownloadURL();
    }

    // Save updated profile data
    await userRef.set({ username, bio, location, photoURL }, { merge: true });

    alert('Profile updated!');
    window.location.href = 'blog.html';
  });
});
