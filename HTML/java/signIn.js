// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAdQIM_mmd2860_QxvO4_Nqfp9p1jDuFsA",
  authDomain: "optima-bank-login-9a2ab.firebaseapp.com",
  projectId: "optima-bank-login-9a2ab",
  storageBucket: "optima-bank-login-9a2ab.appspot.com",
  messagingSenderId: "114013201106",
  appId: "1:114013201106:web:75fdcd84a9861a6769c30b",
  measurementId: "G-P2P25G8F9W"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'en';

/* ===========================
   🔹 CAPTCHA SYSTEM
=========================== */
let currentCaptcha = '';
let captchaVerified = false;
let checkboxChecked = false;

function generateCaptcha() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

function refreshCaptcha() {
  currentCaptcha = generateCaptcha();
  document.getElementById('captchaDisplay').textContent = currentCaptcha;
  document.getElementById('captchaInput').value = '';
  captchaVerified = false;
  document.getElementById('verificationStatus').textContent = '';
  document.getElementById('verificationStatus').className = 'verification-status';
}

function verifyCaptcha(input) {
  const statusEl = document.getElementById('verificationStatus');
  if (input.toUpperCase() === currentCaptcha) {
    captchaVerified = true;
    statusEl.textContent = '✓ Verified';
    statusEl.className = 'verification-status success';
    return true;
  } else {
    captchaVerified = false;
    statusEl.textContent = '✗ Incorrect code';
    statusEl.className = 'verification-status error';
    return false;
  }
}

// Initialize captcha on page load
refreshCaptcha();

// Checkbox handler - show CAPTCHA when checked
document.getElementById('humanCheckbox').addEventListener('change', (e) => {
  checkboxChecked = e.target.checked;
  const captchaSection = document.getElementById('captchaSection');
  
  if (checkboxChecked) {
    captchaSection.style.display = 'block';
    refreshCaptcha(); // Generate new captcha when shown
  } else {
    captchaSection.style.display = 'none';
    captchaVerified = false;
  }
});

// Refresh button
document.getElementById('refreshCaptcha').addEventListener('click', refreshCaptcha);

// Real-time verification as user types
document.getElementById('captchaInput').addEventListener('input', (e) => {
  if (e.target.value.length === 6) {
    verifyCaptcha(e.target.value);
  } else {
    captchaVerified = false;
    document.getElementById('verificationStatus').textContent = '';
  }
});

/* ===========================
   🔹 SHOW MESSAGE HELPER
=========================== */
function showMessage(message, divId) {
  const msgDiv = document.getElementById(divId);
  if (!msgDiv) return;
  msgDiv.innerHTML = message;
  msgDiv.style.display = "block";
  msgDiv.style.opacity = 1;
  setTimeout(() => {
    msgDiv.style.opacity = 0;
  }, 5000);
}

/* ===========================
   🔹 SIGN IN HANDLER (email/password)
=========================== */
const signInForm = document.getElementById("signInForm");
if (signInForm) {
  signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Check checkbox first
    if (!checkboxChecked) {
      showMessage("Please check 'I'm not a robot' first", "SignInMassege");
      return;
    }

    // Verify captcha
    if (!captchaVerified) {
      showMessage("Please complete the verification code", "SignInMassege");
      return;
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem("loggedInUserId", user.uid);
      showMessage("Login successful!", "SignInMassege");

      setTimeout(() => {
        window.location.href = "landingpage.html";
      }, 1500);

    } catch (error) {
      refreshCaptcha(); // Refresh captcha on failed login
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        showMessage("Incorrect email or password", "SignInMassege");
      } else if (error.code === "auth/invalid-email") {
        showMessage("Please enter a valid email address", "SignInMassege");
      } else {
        showMessage("Login error: " + error.message, "SignInMassege");
      }
    }
  });
}

/* ===========================
   🔹 GOOGLE SIGN-IN HANDLER (IMPROVED)
=========================== */
const provider = new GoogleAuthProvider();
// Add these settings to improve popup behavior
provider.setCustomParameters({
  prompt: 'select_account'
});

const googleLoginbtn = document.getElementById('googleLoginbtn');

if (googleLoginbtn) {
  googleLoginbtn.addEventListener("click", async () => {
    // Check checkbox first
    if (!checkboxChecked) {
      showMessage("Please check 'I'm not a robot' first", "SignInMassege");
      return;
    }

    // Verify captcha
    if (!captchaVerified) {
      showMessage("Please complete the verification code", "SignInMassege");
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("✅ User signed in (Google):", user);

      const userEmail = user.email;
      const usersCol = collection(db, "users");
      const q = query(usersCol, where("email", "==", userEmail));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        // User exists - update their record
        const existingDoc = querySnap.docs[0];
        const existingId = existingDoc.id;
        console.log("Found existing user doc for email:", existingId);

        try {
          await updateDoc(doc(db, "users", existingId), {
            googleUid: user.uid,
            lastLoginWith: "google",
            lastLoginAt: new Date().toISOString(),
            photoURL: user.photoURL || null
          });
        } catch (e) {
          console.warn("Could not update existing user doc with googleUid:", e);
        }

        localStorage.setItem("loggedInUserId", existingId);

      } else {
        // New user - create record
        const newUserRef = doc(db, "users", user.uid);
        const newUserData = {
          name: user.displayName || null,
          email: user.email || null,
          photoURL: user.photoURL || null,
          points: 0,
          createdAt: new Date().toISOString(),
          provider: "google",
          lastLoginAt: new Date().toISOString()
        };
        await setDoc(newUserRef, newUserData);
        localStorage.setItem("loggedInUserId", user.uid);
      }

      showMessage("Google sign-in successful!", "SignInMassege");
      
      setTimeout(() => {
        window.location.href = "landingpage.html";
      }, 1000);

    } catch (error) {
      console.error("❌ Google sign-in error:", error.code, error.message);
      refreshCaptcha();
      
      // Better error messages
      let errorMessage = "Google sign-in failed. ";
      
      if (error.code === "auth/unauthorized-domain") {
        errorMessage = "⚠️ Domain not authorized. Please add '" + window.location.hostname + "' to Firebase authorized domains.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage += error.message;
      }
      
      showMessage(errorMessage, "SignInMassege");
    }
  });
}

/* ===========================
   🔹 TOGGLE PASSWORD
=========================== */
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "togglePassword") {
    const pwdField = document.getElementById("password");
    if (!pwdField) return;
    if (pwdField.type === "password") {
      pwdField.type = "text";
      e.target.src = "img/icons8-hide-90.png";
    } else {
      pwdField.type = "password";
      e.target.src = "img/icons8-eye-90.png";
    }
  }
});
