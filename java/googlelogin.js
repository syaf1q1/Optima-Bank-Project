import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBaXQBdJEckt2JS2czwoWqj7ovrbTWho2I",
  authDomain: "optima-bank-login.firebaseapp.com",
  projectId: "optima-bank-login",
  storageBucket: "optima-bank-login.appspot.com",
  messagingSenderId: "191996306770",
  appId: "1:191996306770:web:09b6853a3e4a28287cc68b",
  measurementId: "G-HQ19HSRT1K"
};

// Initialize only if not already done
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.languageCode = 'en';

// Google provider
const provider = new GoogleAuthProvider();

// Bind Google button
const googleLoginbtn = document.getElementById('googleLoginbtn');
if (googleLoginbtn) {
  googleLoginbtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("✅ User signed in:", user);
        window.location.href = "../HTML/landingpage1.html";
      })
      .catch((error) => {
        console.error("❌ Google sign-in error:", error.code, error.message);
        alert("Google sign-in failed: " + error.message);
      });
  });
}
