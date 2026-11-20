import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc,
  collection, 
  addDoc, 
  runTransaction,
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5iNy8JmT76aUP-tfRoNWW2_-l7g2JgCE",
  authDomain: "unistreamtestapp.firebaseapp.com",
  projectId: "unistreamtestapp",
  storageBucket: "nistreamtestapp.firebasestorage.app",
  messagingSenderId: "272403648221",
  appId: "1:272403648221:web:dfac63fecd45b2fa9e5534"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  doc,
  collection, 
  addDoc, 
  runTransaction,
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  serverTimestamp 
};