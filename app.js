import { auth, signOut, onAuthStateChanged } from './firebase.js';

const btnMenu = document.getElementById('btnMenu');
const bottomSheet = document.getElementById('bottomSheet');
const backdrop = document.getElementById('backdrop');
const userAvatar = document.getElementById('userAvatar');
const btnProfile = document.getElementById('btnProfile');
const btnAddPost = document.getElementById('btnAddPost');
const logoutBtn = document.getElementById('logoutBtn');

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