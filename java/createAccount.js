// Import Firebase as in your previous code
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// ===== Dropdown Logic =====
const profileEl = document.querySelector(".profile");
const toggleEl = document.querySelector(".profile-toggle");

toggleEl.addEventListener("click", (e) => {
  e.stopPropagation();
  profileEl.classList.toggle("active");
});

// Close dropdown if clicked outside
window.addEventListener("click", (e) => {
  if (!profileEl.contains(e.target)) {
    profileEl.classList.remove("active");
  }
});

// ===== Logout Button =====
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("loggedInUserId");
      window.location.href = "../HTML/signIn.html"; // redirect to login page
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}

// ===== Fetch User Data (same as before) =====
onAuthStateChanged(auth, async (user) => {
  const loggedInUserId = localStorage.getItem("loggedInUserId");

  if (user && loggedInUserId) {
    try {
      const docRef = doc(db, "users", loggedInUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Update UI
        document.getElementById("loggedInUserName").innerText =
          userData.firstName || user.displayName || "User";
        document.getElementById("loggedInUserPoints").innerText =
          `Point Balance : ${userData.points ?? 0}`;

        document.getElementById("cardUserName").innerText =
          `${userData.firstName ?? ""} ${userData.lastName ?? ""}`;
        document.getElementById("cardUserEmail").innerText =
          userData.email ?? "-";
        document.getElementById("cardFirstName").innerText =
          userData.firstName ?? "-";
        document.getElementById("cardLastName").innerText =
          userData.lastName ?? "-";
        document.getElementById("cardEmail").innerText =
          userData.email ?? "-";
        document.getElementById("cardPassword").innerText = "******";
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }
});
