import { 
  auth, 
  signOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  collection, 
  updateDoc, 
  increment, 
  arrayUnion, 
  arrayRemove, 
  query, 
  orderBy, 
  onSnapshot 
} from './firebase.js';

const feedContainer = document.getElementById('feed');
const btnMenu = document.getElementById('btnMenu');
const bottomSheet = document.getElementById('bottomSheet');
const backdrop = document.getElementById('backdrop');
const userAvatar = document.getElementById('userAvatar');
const btnProfile = document.getElementById('btnProfile');
const btnAddPost = document.getElementById('btnAddPost');
const logoutBtn = document.getElementById('logoutBtn');
const authDialogBackdrop = document.getElementById('authDialogBackdrop');
const authDialogCancel = document.getElementById('authDialogCancel');

if (authDialogCancel) {
  authDialogCancel.addEventListener('click', () => {
    authDialogBackdrop.classList.remove('active');
  });
}

const viewedSessionKey = 'viewed_post_ids';
const viewedPosts = new Set(JSON.parse(sessionStorage.getItem(viewedSessionKey) || '[]'));

function markPostViewed(postId) {
  if (!viewedPosts.has(postId)) {
    viewedPosts.add(postId);
    sessionStorage.setItem(viewedSessionKey, JSON.stringify([...viewedPosts]));
    updateDoc(doc(db, 'posts', postId), {
      views: increment(1)
    }).catch((err) => console.error("View increment error:", err));
  }
}

// Real-time public feed
const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
onSnapshot(postsQuery, (snapshot) => {
  feedContainer.innerHTML = '';
  if (snapshot.empty) {
    feedContainer.innerHTML = '<p class="empty-state">No posts yet</p>';
    return;
  }

  snapshot.forEach((postDoc) => {
    const post = postDoc.data();
    const postId = postDoc.id;
    markPostViewed(postId);

    const likesList = post.likes || [];
    const isLiked = currentUser && likesList.includes(currentUser.uid);
    const likesCount = likesList.length;
    const commentsCount = post.commentsCount || 0;
    const viewsCount = post.views || 0;

    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-author-box">
          <img src="${post.authorAvatar || 'icons/stock.png'}" class="post-author-avatar" referrerpolicy="no-referrer" onerror="this.src='icons/stock.png'">
          <span class="post-author-name">${post.authorName || 'User'}</span>
        </div>
        <span class="post-id">#${post.postNumber || '1'}</span>
      </div>
      <p class="post-text">${post.text}</p>
      <div class="post-footer">
        <button class="post-action-btn like-btn" data-id="${postId}">
          <img src="${isLiked ? 'icons/heart-on.png' : 'icons/heart-off.png'}" alt="Like">
          <span>${likesCount}</span>
        </button>
        <button class="post-action-btn comment-btn" data-id="${postId}">
          <img src="icons/coment.png" alt="Comments">
          <span>${commentsCount}</span>
        </button>
        <button class="post-action-btn share-btn" data-id="${postId}">
          <img src="icons/share.png" alt="Share">
        </button>
        <div class="post-action-btn views-badge">
          <img src="icons/view.png" alt="Views">
          <span>${viewsCount}</span>
        </div>
      </div>
    `;

    // Like toggle
    const likeBtn = postElement.querySelector('.like-btn');
    likeBtn.addEventListener('click', async () => {
      if (!currentUser) {
        authDialogBackdrop.classList.add('active');
        return;
      }
      const postRef = doc(db, 'posts', postId);
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
      }
    });

    // Share link
    const shareBtn = postElement.querySelector('.share-btn');
    shareBtn.addEventListener('click', async () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}#${postId}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        shareBtn.style.opacity = '0.5';
        setTimeout(() => { shareBtn.style.opacity = '1'; }, 400);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    });

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