import { auth, signOut, onAuthStateChanged, db, collection, query, orderBy, onSnapshot } from './firebase.js';

const feedContainer = document.getElementById('feed');
const btnMenu = document.getElementById('btnMenu');
const bottomSheet = document.getElementById('bottomSheet');
const backdrop = document.getElementById('backdrop');
const userAvatar = document.getElementById('userAvatar');
const btnProfile = document.getElementById('btnProfile');
const btnAddPost = document.getElementById('btnAddPost');
const logoutBtn = document.getElementById('logoutBtn');

// Real-time public feed
const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
onSnapshot(postsQuery, (snapshot) => {
  feedContainer.innerHTML = '';
  if (snapshot.empty) {
    feedContainer.innerHTML = '<p class="empty-state">No posts yet</p>';
    return;
  }
  snapshot.forEach((doc) => {
    const post = doc.data();
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-author-box">
          <img src="${post.authorAvatar || 'icons/stock.png'}" class="post-author-avatar">
          <span class="post-author-name">${post.authorName || 'User'}</span>
        </div>
        <span class="post-id">#${post.postNumber || '1'}</span>
      </div>
      <p class="post-text">${post.text}</p>
    `;
    feedContainer.appendChild(postElement);
  });
});

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateHeaderAvatar(user);
});

function requireAuth(callback) {
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  callback();
}

btnProfile.addEventListener('click', () => {
  requireAuth(() => {
    window.location.href = 'profile.html';
  });
});

btnAddPost.addEventListener('click', () => {
  requireAuth(() => {
    window.location.href = 'add-post.html';
  });
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  closeMenu();
  window.location.href = 'login.html';
});

btnMenu.addEventListener('click', () => {
  bottomSheet.classList.add('active');
  backdrop.classList.add('active');
});

backdrop.addEventListener('click', closeMenu);

function closeMenu() {
  bottomSheet.classList.remove('active');
  backdrop.classList.remove('active');
}

function updateHeaderAvatar(user) {
  if (user && user.photoURL) {
    userAvatar.src = user.photoURL;
  } else {
    userAvatar.src = 'icons/stock.png';
  }
}