import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js"; 
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js"; 
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
  collection, 
  getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdQIM_mmd2860_QxvO4_Nqfp9p1jDuFsA",
  authDomain: "optima-bank-login-9a2ab.firebaseapp.com",
  projectId: "optima-bank-login-9a2ab",
  storageBucket: "optima-bank-login-9a2ab.appspot.com",
  messagingSenderId: "114013201106",
  appId: "1:114013201106:web:75fdcd84a9861a6769c30b",
  measurementId: "G-P2P25G8F9W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ========== DOM ELEMENTS ========== */
const nameEl = document.getElementById("loggedInUserName");
const pointsEl = document.getElementById("loggedInUserPoints");
const cartBtn = document.getElementById("cartBtn");
const cartDropdown = document.getElementById("cartDropdown");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const emptyCartMsg = document.getElementById("emptyCartMsg");
const notificationBtn = document.getElementById("notificationBtn");
const notificationDropdown = document.getElementById("notificationDropdown");
const notificationList = document.getElementById("notificationList");
const notificationBadge = document.getElementById("notificationBadge");
const clearAllBtn = document.getElementById("clearAllBtn");
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogout = document.getElementById("confirmLogout");
const cancelLogout = document.getElementById("cancelLogout");

/* ========== STATE ========== */
let balance = 0;
let currentUserId = null;
let cartData = [];
let notifications = [];

/* ========== NOTIFICATION FUNCTIONS ========== */
function addNotification(message, type = 'info') {
  const notification = {
    id: Date.now(),
    message: message,
    type: type,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    unread: true
  };
  
  notifications.unshift(notification);
  updateNotificationUI();
  saveNotifications();
}

function updateNotificationUI() {
  const unreadCount = notifications.filter(n => n.unread).length;
  
  if (unreadCount > 0) {
    notificationBadge.textContent = unreadCount;
    notificationBadge.classList.add('show');
  } else {
    notificationBadge.classList.remove('show');
  }
  
  if (notifications.length === 0) {
    notificationList.innerHTML = '<div class="notification-empty">No new notifications</div>';
    return;
  }
  
  notificationList.innerHTML = notifications.map(notif => `
    <div class="notification-item ${notif.unread ? 'unread' : ''}" data-id="${notif.id}">
      <div>${notif.message}</div>
      <div class="time">${notif.time}</div>
    </div>
  `).join('');
  
  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const notif = notifications.find(n => n.id === id);
      if (notif) {
        notif.unread = false;
        updateNotificationUI();
        saveNotifications();
      }
    });
  });
}

notificationBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  notificationDropdown.classList.toggle('show');
  cartDropdown.classList.remove('show');
  notifications.forEach(n => n.unread = false);
  updateNotificationUI();
  saveNotifications();
});

clearAllBtn.addEventListener('click', () => {
  notifications = [];
  updateNotificationUI();
  saveNotifications();
});

async function loadNotifications() {
  if (!currentUserId) return;
  
  try {
    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().notifications) {
      notifications = userSnap.data().notifications;
      updateNotificationUI();
    }
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

async function saveNotifications() {
  if (!currentUserId) return;
  
  try {
    const userRef = doc(db, "users", currentUserId);
    await updateDoc(userRef, { notifications: notifications });
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

/* ========== CART FUNCTIONS ========== */
function updateCartUI(cart) {
  cartData = cart;
  cartItemsEl.innerHTML = "";

  if (!cart || cart.length === 0) {
    emptyCartMsg.style.display = "block";
    cartCountEl.textContent = 0;
    return;
  }

  emptyCartMsg.style.display = "none";
  cartCountEl.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

  cart.forEach(item => {
    const li = document.createElement("li");
    li.classList.add("cart-item");
    li.innerHTML = `
      <img src="img/${item.img}" alt="${item.name}" class="cart-thumb">
      <div class="cart-info">
        <p class="cart-name">${item.name}</p>
        <p class="cart-qty">${item.price} pts × ${item.qty}</p>
      </div>
    `;
    cartItemsEl.appendChild(li);
  });
}

cartBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  cartDropdown.classList.toggle("show");
  notificationDropdown.classList.remove('show');
});

/* ========== AUTH STATE ========== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "signIn.html";
    return;
  }

  currentUserId = user.uid;
  const docRef = doc(db, "users", currentUserId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    nameEl.textContent = data.firstName || user.displayName || "User";
    balance = data.points || 0;
    updateBalanceUI();
    updateCartUI(data.cart || []);
    loadNotifications();
  }

  loadRedeemedHistory(currentUserId);
});

function updateBalanceUI() {
  pointsEl.textContent = `Balance Points: ${balance}`;
}

/* ========== LOAD REDEEMED HISTORY ========== */
async function loadRedeemedHistory(userId) {
  try {
    const redeemedRef = collection(db, "users", userId, "redeemed");
    const snapshot = await getDocs(redeemedRef);

    const tableBody = document.querySelector("table tbody");
    tableBody.innerHTML = "";

    if (snapshot.empty) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="4" style="text-align:center;">No redeemed vouchers yet</td>`;
      tableBody.appendChild(row);
      return;
    }

    snapshot.forEach(docSnap => {
      const item = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.redeemed_date || "-"}</td>
        <td>${item.name || "Unknown"}</td>
        <td>${item.price || 0} Points</td>
        <td>${item.expires_on || "-"}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching history:", error);
  }
}

/* ========== PROFILE DROPDOWN ========== */
const profileToggle = document.querySelector(".profile-toggle");
const profileEl = document.querySelector(".profile");

if (profileToggle && profileEl) {
  profileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    profileEl.classList.toggle("active");
    notificationDropdown.classList.remove('show');
    cartDropdown.classList.remove('show');
  });
}

/* ========== LOGOUT ========== */
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutModal.style.display = "flex";
  });
}

if (confirmLogout) {
  confirmLogout.addEventListener("click", () => {
    logoutModal.style.display = "none";
    signOut(auth).then(() => {
      window.location.href = "signIn.html";
    });
  });
}

if (cancelLogout) {
  cancelLogout.addEventListener("click", () => {
    logoutModal.style.display = "none";
  });
}

/* ========== CLOSE DROPDOWNS ========== */
window.addEventListener("click", (e) => {
  if (!notificationBtn.contains(e.target)) {
    notificationDropdown.classList.remove('show');
  }
  if (!cartBtn.contains(e.target)) {
    cartDropdown.classList.remove('show');
  }
  if (profileEl && !profileEl.contains(e.target)) {
    profileEl.classList.remove("active");
  }
  
  document.querySelectorAll(".modal").forEach(modal => {
    if (e.target === modal) modal.style.display = "none";
  });
});