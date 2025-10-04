import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
  collection,
  addDoc
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
const cartContainer = document.getElementById("cart-items");
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
    loadCart(data.cart || []);
    loadNotifications();
  }
});

function updateBalanceUI() {
  pointsEl.textContent = `Balance Points: ${balance}`;
}

function generateVoucherCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'OB-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/* ========== LOAD CART UI ========== */
function loadCart(cartArray) {
  updateCartUI(cartArray);
  cartContainer.innerHTML = "";

  if (!cartArray || cartArray.length === 0) {
    cartContainer.innerHTML = "<p style='text-align:center; padding: 40px;'>Your cart is empty.</p>";
    return;
  }

  cartArray.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("voucher-card");
    card.innerHTML = `
      <div class="voucher-info">
        <h2>${item.name}</h2>
        <div class="btn-group">
          <button class="redeem-btn" data-index="${index}" data-price="${item.price}">Redeem</button>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </div>
        <p class="points">-${item.price} Points</p>
        <p>Qty: ${item.qty || 1}</p>
      </div>
      <img src="img/${item.img}" alt="${item.name}" class="voucher-img">
    `;
    cartContainer.appendChild(card);
  });

  // Add event listeners for redeem and delete buttons
  document.querySelectorAll('.redeem-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const price = parseInt(e.target.dataset.price);
      redeemItem(index, price);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deleteItem(index);
    });
  });
}

/* ========== REDEEM ITEM ========== */
async function redeemItem(itemIndex, itemPrice) {
  if (!currentUserId) return;

  try {
    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      let cartArray = userSnap.data().cart || [];
      let userPoints = userSnap.data().points || 0;

      if (userPoints >= itemPrice) {
        const item = cartArray[itemIndex];
        userPoints -= itemPrice;
        cartArray.splice(itemIndex, 1);

        const voucherCode = generateVoucherCode();
        const redeemedDate = new Date().toLocaleDateString("en-GB");
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        const expiresOn = expiryDate.toLocaleDateString("en-GB");

        await updateDoc(userRef, {
          cart: cartArray,
          points: userPoints,
        });

        const redeemedVoucher = {
          id: item.id,
          name: item.name,
          price: itemPrice,
          img: item.img,
          code: voucherCode,
          redeemed_date: redeemedDate,
          expires_on: expiresOn
        };

        await addDoc(collection(db, "users", currentUserId, "redeemed"), redeemedVoucher);

        balance = userPoints;
        updateBalanceUI();
        loadCart(cartArray);
        
        addNotification(`${item.name} redeemed successfully! Code: ${voucherCode}`, 'success');
      } else {
        addNotification('Not enough points to redeem this item', 'error');
      }
    }
  } catch (error) {
    console.error("Error redeeming item:", error);
    addNotification('Error redeeming item', 'error');
  }
}

/* ========== DELETE ITEM ========== */
async function deleteItem(itemIndex) {
  if (!currentUserId) return;

  try {
    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      let cartArray = userSnap.data().cart || [];
      const item = cartArray[itemIndex];

      cartArray.splice(itemIndex, 1);

      await updateDoc(userRef, { cart: cartArray });

      loadCart(cartArray);
      addNotification(`${item.name} removed from cart`, 'info');
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    addNotification('Error removing item', 'error');
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