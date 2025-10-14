import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  collection, 
  addDoc 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

/* ========== PDF GENERATOR ========== */
window.VoucherPDFGenerator = {
generatePDF: function(voucherData) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const primaryColor = [140, 26, 106];
    const textColor = [51, 51, 51];
    const lightGray = [200, 200, 200];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('OPTIMA BANK', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('VOUCHER REDEMPTION', 105, 30, { align: 'center' });

    // Main content box
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.rect(15, 50, 180, 120);

    // Create QR Code data
    const qrData = `
Voucher: ${voucherData.name}
Code: ${voucherData.code}
User: ${voucherData.userName}
Value: ${voucherData.price} Points
Redeemed: ${voucherData.date}
Expires: ${voucherData.expires}
    `.trim();

    // Generate QR code as Data URL
    QRCode.toDataURL(qrData, { width: 100, margin: 1 }, (err, qrUrl) => {
      if (err) {
        console.error("QR Code generation failed:", err);
        return;
      }

      // Load voucher image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = 'img/' + voucherData.img;

      img.onload = () => {
        // Draw voucher image top-right
        doc.addImage(img, 'JPEG', 160, 55, 30, 30);

        // Text details
        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');

        let y = 65;
        const leftMargin = 25;
        const lineHeight = 10;

        doc.text('Voucher:', leftMargin, y);
        doc.setFont(undefined, 'normal');
        const voucherName = voucherData.name.length > 25 ? voucherData.name.substring(0, 25) + '...' : voucherData.name;
        doc.text(voucherName, leftMargin + 30, y);

        y += lineHeight;
        doc.setFont(undefined, 'bold');
        doc.text('Code:', leftMargin, y);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text(voucherData.code, leftMargin + 30, y);

        y += lineHeight + 2;
        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Value:', leftMargin, y);
        doc.setFont(undefined, 'normal');
        doc.text(`${voucherData.price} Points`, leftMargin + 30, y);

        y += lineHeight + 5;
        doc.setFont(undefined, 'bold');
        doc.text('Redeemed Date:', leftMargin, y);
        doc.setFont(undefined, 'normal');
        doc.text(voucherData.date, leftMargin + 40, y);

        y += lineHeight;
        doc.setFont(undefined, 'bold');
        doc.text('Expires On:', leftMargin, y);
        doc.setFont(undefined, 'normal');
        doc.text(voucherData.expires, leftMargin + 40, y);

        y += lineHeight;
        doc.setFont(undefined, 'bold');
        doc.text('User:', leftMargin, y);
        doc.setFont(undefined, 'normal');
        doc.text(voucherData.userName, leftMargin + 40, y);

        // Divider
        y += lineHeight + 5;
        doc.setDrawColor(...lightGray);
        doc.line(25, y, 185, y);

        // Terms & Conditions
        y += 10;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('TERMS & CONDITIONS:', leftMargin, y);

        y += 8;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const terms = [
          '• This voucher is valid until expiry date',
          '• Cannot be exchanged for cash',
          '• One-time use only',
          '• Present this voucher at the time of purchase'
        ];
        terms.forEach(term => {
          doc.text(term, leftMargin + 5, y);
          y += 6;
        });

        // Add QR code image to bottom
        doc.addImage(qrUrl, 'PNG', 85, 180, 40, 40);

        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.text('Scan QR Code', 105, 225, { align: 'center' });
        doc.setFontSize(8);
        doc.text('for verification', 105, 231, { align: 'center' });

        // Footer
        doc.setFillColor(...primaryColor);
        doc.rect(0, 270, 210, 27, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('Thank you for choosing Optima Bank!', 105, 280, { align: 'center' });
        doc.setFontSize(9);
        doc.text('For support: support@optimabank.com', 105, 287, { align: 'center' });

        // Save the final PDF
        doc.save(`Optima_Bank_Voucher_${voucherData.code}.pdf`);
      };
    });

    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    return false;
  }
},

  
  generatePDFWithoutImage: function(doc, voucherData, primaryColor, textColor, lightGray) {
    // Same PDF generation but without waiting for image
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    let y = 65;
    const leftMargin = 25;
    const lineHeight = 10;
    
    // Placeholder for image
    doc.setDrawColor(...lightGray);
    doc.rect(160, 55, 30, 30);
    doc.setFontSize(8);
    doc.text('Image', 175, 72, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Voucher:', leftMargin, y);
    doc.setFont(undefined, 'normal');
    const voucherName = voucherData.name.length > 25 ? voucherData.name.substring(0, 25) + '...' : voucherData.name;
    doc.text(voucherName, leftMargin + 30, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Code:', leftMargin, y);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(voucherData.code, leftMargin + 30, y);
    
    y += lineHeight + 2;
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Value:', leftMargin, y);
    doc.setFont(undefined, 'normal');
    doc.text(`${voucherData.price} Points`, leftMargin + 30, y);
    
    y += lineHeight + 5;
    doc.setFont(undefined, 'bold');
    doc.text('Redeemed Date:', leftMargin, y);
    doc.setFont(undefined, 'normal');
    doc.text(voucherData.date, leftMargin + 40, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Expires On:', leftMargin, y);
    doc.setFont(undefined, 'normal');
    doc.text(voucherData.expires, leftMargin + 40, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('User:', leftMargin, y);
    doc.setFont(undefined, 'normal');
    doc.text(voucherData.userName, leftMargin + 40, y);
    
    y += lineHeight + 5;
    doc.setDrawColor(...lightGray);
    doc.line(25, y, 185, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('TERMS & CONDITIONS:', leftMargin, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const terms = [
      '• This voucher is valid until expiry date',
      '• Cannot be exchanged for cash',
      '• One-time use only',
      '• Present this voucher at the time of purchase'
    ];
    
    terms.forEach(term => {
      doc.text(term, leftMargin + 5, y);
      y += 6;
    });
    
    // QR Code at bottom
    doc.setDrawColor(...lightGray);
    doc.rect(85, 185, 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.text('Scan QR Code', 105, 205, { align: 'center' });
    doc.setFontSize(8);
    doc.text('for verification', 105, 212, { align: 'center' });
    
    doc.setFillColor(...primaryColor);
    doc.rect(0, 270, 210, 27, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Thank you for choosing Optima Bank!', 105, 280, { align: 'center' });
    doc.setFontSize(9);
    doc.text('For support: support@optimabank.com', 105, 287, { align: 'center' });
    
    doc.save(`Optima_Bank_Voucher_${voucherData.code}.pdf`);
  }
};

/* ========== FIREBASE INIT ========== */
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
const errorModal = document.getElementById("pointsModal");
const successModal = document.getElementById("successModal");
const modalBalance = document.getElementById("modalBalance");
const successBalance = document.getElementById("successBalance");
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogout = document.getElementById("confirmLogout");
const cancelLogout = document.getElementById("cancelLogout");
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

/* ========== STATE ========== */
let balance = 0;
let currentUserId = null;
let cartData = [];
let notifications = [];
let lastRedeemedVoucher = null;
let downloadedVouchers = new Set();

/* ========== NOTIFICATION FUNCTIONS ========== */
function addNotification(message, type = 'info', voucherCode = null) {
  const notification = {
    id: Date.now(),
    message: message,
    type: type,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    unread: true,
    voucherCode: voucherCode,
    downloaded: false
  };
  
  notifications.unshift(notification);
  updateNotificationUI();
  saveNotifications(); // Save to Firestore
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
  
  notificationList.innerHTML = notifications.map(notif => {
    const isDownloaded = notif.downloaded || (notif.voucherCode && downloadedVouchers.has(notif.voucherCode));
    const displayMessage = isDownloaded && notif.message.includes('Download your voucher') 
      ? notif.message.replace('Download your voucher now', 'Voucher already downloaded')
      : notif.message;
    
    return `
      <div class="notification-item ${notif.unread ? 'unread' : ''}" 
           data-id="${notif.id}" 
           data-voucher-code="${notif.voucherCode || ''}"
           style="${isDownloaded ? 'opacity: 0.6; cursor: default;' : ''}">
        <div>${displayMessage}</div>
        <div class="time">${notif.time}</div>
      </div>
    `;
  }).join('');
  
  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const voucherCode = item.dataset.voucherCode;
      const notif = notifications.find(n => n.id === id);
      
      if (notif) {
        notif.unread = false;
        
        if (notif.downloaded || (voucherCode && downloadedVouchers.has(voucherCode))) {
          updateNotificationUI();
          saveNotifications(); // Save after marking as read
          return;
        }
        
        updateNotificationUI();
        saveNotifications(); // Save after marking as read
        
        if (notif.message.includes('Download your voucher') && lastRedeemedVoucher) {
          downloadVoucher(lastRedeemedVoucher);
          notif.downloaded = true;
          if (voucherCode) {
            downloadedVouchers.add(voucherCode);
          }
          updateNotificationUI();
          saveNotifications(); // Save after download
        }
      }
    });
  });
}

notificationBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  notificationDropdown.classList.toggle('show');
  cartDropdown.classList.remove('show');
  
  // Mark all as read when opening
  notifications.forEach(n => n.unread = false);
  updateNotificationUI();
  saveNotifications(); // Save after marking all as read
});

clearAllBtn.addEventListener('click', () => {
  notifications = [];
  updateNotificationUI();
  saveNotifications(); // Save after clearing all
});

/* ========== DOWNLOAD VOUCHER ========== */
function downloadVoucher(voucherData) {
  if (!voucherData) return;
  
  if (downloadedVouchers.has(voucherData.code)) {
    addNotification('This voucher has already been downloaded', 'warning');
    return;
  }
  
  voucherData.userName = nameEl.textContent;
  
  if (window.VoucherPDFGenerator && typeof window.jspdf !== 'undefined') {
    const success = window.VoucherPDFGenerator.generatePDF(voucherData);
    if (success) {
      downloadedVouchers.add(voucherData.code);
      addNotification('Voucher downloaded successfully!', 'success');
    } else {
      downloadVoucherAsText(voucherData);
    }
  } else {
    downloadVoucherAsText(voucherData);
  }
}

function downloadVoucherAsText(voucherData) {
  const voucherContent = `
╔═══════════════════════════════════════════════════════╗
║                   OPTIMA BANK                         ║
║               VOUCHER REDEMPTION                      ║
╠═══════════════════════════════════════════════════════╣
║  Voucher: ${voucherData.name.padEnd(41)}║
║  Code: ${voucherData.code.padEnd(44)}║
║  Value: ${voucherData.price} Points${' '.repeat(38 - String(voucherData.price).length)}║
║  Redeemed Date: ${voucherData.date.padEnd(34)}║
║  Expires On: ${voucherData.expires.padEnd(37)}║
║  User: ${voucherData.userName.padEnd(44)}║
╚═══════════════════════════════════════════════════════╝
  `.trim();
  
  const blob = new Blob([voucherContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Optima_Bank_Voucher_${voucherData.code}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  downloadedVouchers.add(voucherData.code);
  addNotification('Voucher downloaded successfully!', 'success');
}

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
    
    // Load notifications from Firestore
    loadNotifications();
  }
});

/* ========== LOAD & SAVE NOTIFICATIONS ========== */
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
    await updateDoc(userRef, { 
      notifications: notifications 
    });
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

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

/* ========== CARD ACTIONS ========== */
document.querySelectorAll(".deal-card").forEach((card) => {
  const img = card.querySelector("img");
  const redeemBtn = card.querySelector(".btn-redeem");
  const cartBtnEl = card.querySelector(".btn-cart");

  img.addEventListener("click", () => {
    const voucherId = card.dataset.id;
    window.location.href = `vocherinfo.html?id=${voucherId}`;
  });

  redeemBtn.addEventListener("click", async () => {
    const price = parseInt(card.dataset.price);

    if (price <= balance) {
      balance -= price;
      updateBalanceUI();
      successBalance.textContent = balance;
      successModal.style.display = "flex";

      const voucherCode = generateVoucherCode();
      const redeemedDate = new Date().toLocaleDateString("en-GB");
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      const expiresOn = expiryDate.toLocaleDateString("en-GB");

      lastRedeemedVoucher = {
        name: card.dataset.name,
        code: voucherCode,
        price: price,
        img: card.dataset.img,
        date: redeemedDate,
        expires: expiresOn
      };

      if (currentUserId) {
        const userRef = doc(db, "users", currentUserId);
        await updateDoc(userRef, { points: balance });

        const redeemedVoucher = {
          id: card.dataset.id,
          name: card.dataset.name,
          price: price,
          img: card.dataset.img,
          code: voucherCode,
          redeemed_date: redeemedDate,
          expires_on: expiresOn
        };

        await addDoc(collection(db, "users", currentUserId, "redeemed"), redeemedVoucher);
      }

      document.getElementById("redeemItemName").textContent = card.dataset.name + " Redeemed!";
      document.getElementById("redeemItemImg").src = "img/" + card.dataset.img;
      document.getElementById("redeemItemPrice").textContent = price;
      document.getElementById("updatedBalance").textContent = balance;
      document.getElementById("redeemModal").style.display = "flex";

      addNotification(`${card.dataset.name} redeemed successfully! Download your voucher now.`, 'success', voucherCode);

    } else {
      modalBalance.textContent = balance;
      errorModal.style.display = "flex";
    }
  });

  cartBtnEl.addEventListener("click", async () => {
    if (!currentUserId) {
      alert("You must be logged in to add to cart!");
      return;
    }

    const product = {
      id: card.dataset.id,
      name: card.dataset.name,
      price: parseInt(card.dataset.price),
      img: card.dataset.img,
      qty: 1
    };

    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      let userData = userSnap.data();
      let cart = userData.cart || [];

      const existingIndex = cart.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push(product);
      }

      await updateDoc(userRef, { cart });
      updateCartUI(cart);

      document.getElementById("cartItemName").textContent = product.name;
      document.getElementById("cartItemImg").src = "img/" + product.img;
      document.getElementById("cartItemPrice").textContent = product.price;
      document.getElementById("cartItemQty").textContent = 
        existingIndex > -1 ? cart[existingIndex].qty : 1;

      document.getElementById("cartModal").style.display = "flex";
      
      addNotification(`${product.name} added to cart`, 'info');
    } else {
      await setDoc(userRef, { cart: [product] }, { merge: true });
    }
  });
});

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

/* ========== CART DROPDOWN ========== */
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

/* ========== DOWNLOAD VOUCHER BUTTON ========== */
document.getElementById("downloadVoucherBtn").addEventListener("click", () => {
  if (lastRedeemedVoucher && !downloadedVouchers.has(lastRedeemedVoucher.code)) {
    downloadVoucher(lastRedeemedVoucher);
    const btn = document.getElementById("downloadVoucherBtn");
    btn.textContent = "Downloaded";
    btn.style.background = "#6c757d";
    btn.style.cursor = "not-allowed";
    btn.disabled = true;
  } else if (lastRedeemedVoucher && downloadedVouchers.has(lastRedeemedVoucher.code)) {
    addNotification('This voucher has already been downloaded', 'warning');
  }
});

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

/* ========== CLOSE MODALS ========== */
document.querySelectorAll(".modal .close").forEach(closeBtn => {
  closeBtn.addEventListener("click", () => {
    closeBtn.closest(".modal").style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  document.querySelectorAll(".modal").forEach(modal => {
    if (e.target === modal) modal.style.display = "none";
  });
  
  if (!notificationBtn.contains(e.target)) {
    notificationDropdown.classList.remove('show');
  }
  if (!cartBtn.contains(e.target)) {
    cartDropdown.classList.remove('show');
  }
  if (profileEl && !profileEl.contains(e.target)) {
    profileEl.classList.remove("active");
  }
});

document.getElementById("continueRedeemBtn").onclick = () => {
  document.getElementById("redeemModal").style.display = "none";
  const btn = document.getElementById("downloadVoucherBtn");
  btn.textContent = "Download Voucher";
  btn.style.background = "";
  btn.style.cursor = "";
  btn.disabled = false;
};

document.getElementById("continueBtn").onclick = () => {
  document.getElementById("cartModal").style.display = "none";
};

document.getElementById("goToCartBtn").onclick = () => {
  window.location.href = "cart.html";
};