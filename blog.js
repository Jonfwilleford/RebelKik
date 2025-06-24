document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // Firebase Initialization
  // =========================
  const auth = firebase.auth();
  const db = firebase.firestore();
  const logoutBtn = document.getElementById('logoutBtn');
  const postForm = document.getElementById('postForm');
  const postsDiv = document.getElementById('posts');

  // Cache for author info to reduce Firestore reads
  const authorCache = {};

  // =========================
  // Auth State Check
  // Redirects to login if not authenticated
  // =========================
  auth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      document.getElementById('username').textContent = userData?.username || user.email;
    } catch (err) {
      console.error('Error loading user profile:', err);
      document.getElementById('username').textContent = user.email;
    }
  });

  // =========================
  // Logout Button Handler
  // =========================
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut()
        .then(() => {
          alert('Logged out!');
          window.location.href = 'index.html';
        })
        .catch(err => {
          console.error('Logout error:', err);
          alert('Logout failed: ' + err.message);
        });
    });
  }

  // =========================
  // New Post Form Handler
  // =========================
  if (postForm) {
    postForm.addEventListener('submit', e => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to post.');
        return;
      }
      const body = postForm['postBody'].value.trim();
      if (body === '') {
        alert('Please write something before posting.');
        return;
      }
      db.collection('posts').add({
        body,
        authorEmail: user.email,
        authorUid: user.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        alert('Post added!');
        postForm.reset();
      })
      .catch(err => {
        console.error('Error adding post:', err);
        alert('Error posting: ' + err.message);
      });
    });
  }

  // =========================
  // Load and Render Posts
  // =========================
  if (postsDiv) {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(async snapshot => {
      postsDiv.innerHTML = '';

      for (const doc of snapshot.docs) {
        const post = doc.data();

        // Get author info from cache or Firestore
        let authorInfo = authorCache[post.authorEmail];
        if (!authorInfo) {
          try {
            if (post.authorUid) {
              const userDoc = await db.collection('users').doc(post.authorUid).get();
              if (userDoc.exists) {
                authorInfo = userDoc.data();
              }
            }
            if (!authorInfo) {
              authorInfo = { username: post.authorEmail, photoURL: 'default-avatar.png' };
            }
          } catch (err) {
            console.error('Error fetching author info:', err);
            authorInfo = { username: post.authorEmail, photoURL: 'default-avatar.png' };
          }
          authorCache[post.authorEmail] = authorInfo;
        }

        // =========================
        // Create Post Element
        // =========================
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Author container (photo + username side by side)
        const authorContainer = document.createElement('div');
        authorContainer.style.display = 'flex';
        authorContainer.style.alignItems = 'center';
        authorContainer.style.marginBottom = '8px';

        // Profile photo
        const authorPhoto = document.createElement('img');
        authorPhoto.src = authorInfo.photoURL || 'default-avatar.png';
        authorPhoto.alt = authorInfo.username + "'s profile photo";
        authorPhoto.style.width = '40px';
        authorPhoto.style.height = '40px';
        authorPhoto.style.borderRadius = '50%';
        authorPhoto.style.objectFit = 'cover';
        authorPhoto.style.marginRight = '10px';

        // Username
        const authorName = document.createElement('strong');
        authorName.textContent = authorInfo.username || post.authorEmail;
        authorName.style.fontSize = '16px';

        authorContainer.appendChild(authorPhoto);
        authorContainer.appendChild(authorName);

        postElement.appendChild(authorContainer);

        // Post message body
        const bodyEl = document.createElement('p');
        bodyEl.textContent = post.body;
        bodyEl.style.marginTop = '0';
        bodyEl.style.marginBottom = '5px';
        postElement.appendChild(bodyEl);

        // Timestamp below the message
        const timeEl = document.createElement('small');
        timeEl.style.color = '#999';
        timeEl.textContent = formatTimeAgo(post.timestamp);
        postElement.appendChild(timeEl);

        postsDiv.appendChild(postElement);
      }
    });
  }

  // =========================
  // Helper: Format Timestamp as "posted x time ago"
  // =========================
  function formatTimeAgo(timestamp) {
    if (!timestamp) return '';

    const postDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - postDate) / 1000);

    if (seconds < 60) {
      return `posted ${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `posted ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `posted ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(hours / 24);
    return `posted ${days} day${days !== 1 ? 's' : ''} ago`;
  }
});
