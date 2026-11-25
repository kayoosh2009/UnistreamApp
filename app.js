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
const publicPollsList = document.getElementById('publicPollsList');
const tabFeedGlobal = document.getElementById('tabFeedGlobal');
const tabFeedRecommended = document.getElementById('tabFeedRecommended');
const tabFeedPolls = document.getElementById('tabFeedPolls');
const feedRecommended = document.getElementById('feedRecommended');
const feedPolls = document.getElementById('feedPolls');

if (tabFeedGlobal && tabFeedRecommended && tabFeedPolls) {
  const switchFeedTab = (activeTab, activeView) => {
    [tabFeedGlobal, tabFeedRecommended, tabFeedPolls].forEach(tab => tab.classList.remove('active'));
    [feedContainer, feedRecommended, feedPolls].forEach(view => view.classList.add('hidden'));

    activeTab.classList.add('active');
    activeView.classList.remove('hidden');
  };

  tabFeedGlobal.addEventListener('click', () => switchFeedTab(tabFeedGlobal, feedContainer));
  tabFeedRecommended.addEventListener('click', () => switchFeedTab(tabFeedRecommended, feedRecommended));
  tabFeedPolls.addEventListener('click', () => switchFeedTab(tabFeedPolls, feedPolls));
}

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

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffSec = Math.floor((new Date() - date) / 1000);

  if (diffSec < 60) {
    return diffSec <= 1 ? '1 second ago' : `${diffSec} seconds ago`;
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

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
          <div class="post-author-details">
            <span class="post-author-name">${post.authorName || 'User'}</span>
            <span class="post-time">${formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
        <span class="post-id">#${post.postNumber || '1'}</span>
      </div>
      ${post.text ? `<p class="post-text">${post.text}</p>` : ''}
      ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-attachment-img" alt="Post photo">` : ''}
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

// Instant render from local cache to prevent avatar flickering ⚡
const cachedProfile = JSON.parse(localStorage.getItem('user_cached_profile') || 'null');
if (cachedProfile && cachedProfile.avatarUrl) {
  userAvatar.src = cachedProfile.avatarUrl;
}

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateHeaderAvatar(user);
  loadPublicSurveys();
});

// Real-time public polls feed
let cachedSurveysSnapshot = null;

function renderSurveysFeed(snapshot) {
  if (!publicPollsList) return;
  publicPollsList.innerHTML = '';

  if (snapshot.empty) {
    publicPollsList.innerHTML = '<p class="empty-state">No polls available</p>';
    return;
  }

  snapshot.forEach((docSnap) => {
    const survey = docSnap.data();
    const surveyId = docSnap.id;

    const isCompleted = Boolean(
      currentUser && 
      survey.voters && 
      (survey.voters[currentUser.uid] !== undefined || (Array.isArray(survey.completedUsers) && survey.completedUsers.includes(currentUser.uid)))
    );

    const welcomeImg = (survey.welcome && survey.welcome.image) || null;
    const title = (survey.hasWelcome && survey.welcome?.title) || survey.question || 'Community Survey';
    const desc = (survey.hasWelcome && survey.welcome?.description) || '';
    const qCount = survey.totalQuestions || (survey.questions ? survey.questions.length : 1);
    const votesCount = survey.totalVotes || 0;

    const card = document.createElement('div');
    card.className = 'public-poll-card';
    card.innerHTML = `
      ${welcomeImg ? `
        <div class="poll-cover-wrap">
          <img src="${welcomeImg}" class="poll-cover-img" alt="Poll cover">
        </div>
      ` : ''}
      <div class="poll-card-body">
        <div class="poll-card-top">
          <div class="poll-author-info">
            <img src="${survey.authorAvatar || 'icons/stock.png'}" class="poll-author-avatar" referrerpolicy="no-referrer">
            <span>${survey.authorName || 'Creator'}</span>
          </div>
          ${isCompleted 
            ? `<span class="poll-badge-status completed">✓ Completed</span>` 
            : `<span class="poll-badge-status active">Active Poll</span>`
          }
        </div>

        <h3 class="poll-card-headline">${title}</h3>
        ${desc ? `<p class="poll-card-desc">${desc}</p>` : ''}

        <div class="poll-card-footer">
          <div class="poll-stats-meta">
            <span>${qCount} Questions</span>
            <span>•</span>
            <span>${votesCount} Votes</span>
          </div>
          <button class="btn-open-poll ${isCompleted ? 'done' : ''}" data-id="${surveyId}">
            ${isCompleted ? 'View Results' : 'Take Poll →'}
          </button>
        </div>
      </div>
    `;

    card.querySelector('.btn-open-poll').addEventListener('click', () => {
      window.location.href = `analysis/take-survey.html?id=${surveyId}`;
    });

    publicPollsList.appendChild(card);
  });
}

function loadPublicSurveys() {
  const surveysFeedQuery = query(collection(db, 'surveys'), orderBy('createdAt', 'desc'));
  onSnapshot(surveysFeedQuery, (snapshot) => {
    cachedSurveysSnapshot = snapshot;
    renderSurveysFeed(snapshot);
  });
}

function requireAuth(callback) {
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  callback();
}

// Navigate to profile via bottom nav icon or top header avatar ✨
btnProfile.addEventListener('click', () => {
  requireAuth(() => {
    window.location.href = 'profile.html';
  });
});

userAvatar.addEventListener('click', () => {
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
  localStorage.removeItem('user_cached_profile');
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
  const cached = JSON.parse(localStorage.getItem('user_cached_profile') || 'null');
  if (cached && cached.avatarUrl) {
    userAvatar.src = cached.avatarUrl;
  } else if (user && user.photoURL) {
    userAvatar.src = user.photoURL;
  } else {
    userAvatar.src = 'icons/stock.png';
  }
}