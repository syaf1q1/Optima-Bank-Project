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

/* PDF GENERATOR */
window.VoucherPDFGenerator = {
  generatePDF: function(voucherData) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const primaryColor = [140, 26, 106];
      const textColor = [51, 51, 51];
      const lightGray = [200, 200, 200];
      
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('OPTIMA BANK', 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.text('VOUCHER REDEMPTION', 105, 30, { align: 'center' });
      
      doc.setDrawColor(...lightGray);
      doc.setLineWidth(0.5);
      doc.rect(15, 50, 180, 120);
      
      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      
      let y = 65;
      const leftMargin = 25;
      const lineHeight = 10;
      
      doc.text('Voucher:', leftMargin, y);
      doc.setFont(undefined, 'normal');
      doc.text(voucherData.name, leftMargin + 30, y);
      
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
      
      doc.setFillColor(...primaryColor);
      doc.rect(0, 270, 210, 27, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Thank you for choosing Optima Bank!', 105, 280, { align: 'center' });
      doc.setFontSize(9);
      doc.text('For support: support@optimabank.com', 105, 287, { align: 'center' });
      
      doc.setDrawColor(...lightGray);
      doc.rect(160, 55, 30, 30);
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text('QR Code', 175, 72, { align: 'center' });
      
      doc.save(`Optima_Bank_Voucher_${voucherData.code}.pdf`);
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      return false;
    }
  }
};

/* FIREBASE INIT */
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

/* DOM ELEMENTS */
const nameEl = document.getElementById("loggedInUserName");
const pointsEl = document.getElementById("loggedInUserPoints");
const voucherDetails = document.getElementById("voucherDetails");
const voucherImg = document.getElementById("voucherImg");
const errorModal = document.getElementById("pointsModal");
const successModal = document.getElementById("successModal");
const cartModal = document.getElementById("cartModal");
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

/* STATE */
let balance = 0;
let currentUserId = null;
let cartData = [];
let notifications = [];
let lastRedeemedVoucher = null;
let downloadedVouchers = new Set();

/* NOTIFICATION FUNCTIONS */
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
          return;
        }
        
        updateNotificationUI();
        
        if (notif.message.includes('Download your voucher') && lastRedeemedVoucher) {
          downloadVoucher(lastRedeemedVoucher);
          notif.downloaded = true;
          if (voucherCode) {
            downloadedVouchers.add(voucherCode);
          }
          updateNotificationUI();
        }
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
});

clearAllBtn.addEventListener('click', () => {
  notifications = [];
  updateNotificationUI();
});

/* DOWNLOAD VOUCHER */
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

function generateVoucherCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'OB-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/* AUTH STATE */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "signIn.html";
    return;
  }

  currentUserId = user.uid;
  
  try {
    const docRef = doc(db, "users", currentUserId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      nameEl.textContent = data.firstName || user.displayName || "User";
      balance = data.points || 0;
      updateBalanceUI();
      updateCartUI(data.cart || []);
    } else {
      await setDoc(docRef, {
        firstName: user.displayName || "User",
        email: user.email,
        points: 0,
        cart: []
      });
      balance = 0;
      updateBalanceUI();
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  await loadVoucher();
});

/* BALANCE UI */
function updateBalanceUI() {
  pointsEl.textContent = `Balance Points: ${balance}`;
}

/* LOAD VOUCHER */
const urlParams = new URLSearchParams(window.location.search);
const voucherId = urlParams.get("id");

async function loadVoucher() {
  if (!voucherId) {
    voucherDetails.innerHTML = "<p>No voucher ID provided.</p>";
    return;
  }

  console.log("Loading voucher with ID:", voucherId);

  try {
    const docRef = doc(db, "vouchers", voucherId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const voucher = docSnap.data();
      voucher.id = docSnap.id;

      console.log("Voucher data loaded:", voucher);

      let featuresHTML = '';
      if (Array.isArray(voucher.features) && voucher.features.length > 0) {
        featuresHTML = `<ul>${voucher.features.map(f => `<li>${f}</li>`).join("")}</ul>`;
      } else if (typeof voucher.features === 'string') {
        featuresHTML = `<p>${voucher.features}</p>`;
      }

      voucherDetails.innerHTML = `
        <h2>${voucher.name || 'Voucher'}</h2>
        <p>${voucher.description || 'No description available'}</p>
        ${featuresHTML}
        <div class="points-text"><span id="price">${voucher.points || voucher.price || 0}</span> Points</div>
        <div class="terms">
          <input type="checkbox" id="agree">
          <label for="agree">I agree to the terms and conditions</label>
        </div>
        <div class="buttons">
          <button class="btn btn-redeem" id="redeemBtn">REDEEM</button>
          <button class="btn btn-cart" id="addCartBtn">ADD TO CART</button>
        </div>
      `;

      voucherImg.src = voucher.imageURL || voucher.image || 'img/placeholder.png';
      voucherImg.onerror = () => {
        voucherImg.src = 'img/placeholder.png';
      };

      setupRedeem(voucher);
      setupCart(voucher);
    } else {
      console.error("Voucher not found in database");
      voucherDetails.innerHTML = "<p>Voucher not found in database.</p>";
    }
  } catch (err) {
    console.error("Error loading voucher:", err);
    voucherDetails.innerHTML = `<p>Error loading voucher details: ${err.message}</p>`;
  }
}

/* REDEEM FUNCTION */
function setupRedeem(voucher) {
  const redeemBtn = document.getElementById("redeemBtn");
  if (!redeemBtn) return;
  
  redeemBtn.addEventListener("click", async () => {
    const agreeCheckbox = document.getElementById("agree");
    if (!agreeCheckbox || !agreeCheckbox.checked) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    const voucherPoints = voucher.points || voucher.price || 0;

    if (voucherPoints <= balance) {
      balance -= voucherPoints;
      updateBalanceUI();
      successBalance.textContent = balance;

      const voucherCode = generateVoucherCode();
      const redeemedDate = new Date().toLocaleDateString("en-GB");
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      const expiresOn = expiryDate.toLocaleDateString("en-GB");

      lastRedeemedVoucher = {
        name: voucher.name || 'Voucher',
        code: voucherCode,
        price: voucherPoints,
        img: voucher.imageURL || voucher.image || '',
        date: redeemedDate,
        expires: expiresOn
      };

      try {
        const userRef = doc(db, "users", currentUserId);
        await updateDoc(userRef, { points: balance });

        const redeemedVoucher = {
          id: voucher.id,
          name: voucher.name || 'Voucher',
          price: voucherPoints,
          img: voucher.imageURL || voucher.image || '',
          code: voucherCode,
          redeemed_date: redeemedDate,
          expires_on: expiresOn
        };

        await addDoc(collection(db, "users", currentUserId, "redeemed"), redeemedVoucher);

        document.getElementById("redeemItemName").textContent = (voucher.name || 'Voucher') + " Redeemed!";
        document.getElementById("redeemItemImg").src = voucher.imageURL || voucher.image || '';
        document.getElementById("redeemItemPrice").textContent = voucherPoints;
        document.getElementById("updatedBalance").textContent = balance;
        document.getElementById("redeemModal").style.display = "flex";

        addNotification(`${voucher.name || 'Voucher'} redeemed successfully! Download your voucher now.`, 'success', voucherCode);
      } catch (error) {
        console.error("Error redeeming voucher:", error);
        alert("Error redeeming voucher. Please try again.");
      }
    } else {
      modalBalance.textContent = balance;
      errorModal.style.display = "flex";
    }
  });
}

/* ADD TO CART FUNCTION */
function setupCart(voucher) {
  const addCartBtn = document.getElementById("addCartBtn");
  if (!addCartBtn) return;
  
  addCartBtn.addEventListener("click", async () => {
    if (!currentUserId) {
      alert("You must be logged in to add to cart!");
      return;
    }

    const voucherPoints = voucher.points || voucher.price || 0;

    const product = {
      id: voucher.id,
      name: voucher.name || 'Voucher',
      price: voucherPoints,
      img: voucher.imageURL || voucher.image || '',
      qty: 1
    };

    try {
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
        document.getElementById("cartItemImg").src = product.img;
        document.getElementById("cartItemPrice").textContent = product.price;
        document.getElementById("cartItemQty").textContent = 
          existingIndex > -1 ? cart[existingIndex].qty : 1;

        cartModal.style.display = "flex";
        
        addNotification(`${product.name} added to cart`, 'info');
      } else {
        await setDoc(userRef, { cart: [product] }, { merge: true });
        updateCartUI([product]);
        
        document.getElementById("cartItemName").textContent = product.name;
        document.getElementById("cartItemImg").src = product.img;
        document.getElementById("cartItemPrice").textContent = product.price;
        document.getElementById("cartItemQty").textContent = 1;

        cartModal.style.display = "flex";
        
        addNotification(`${product.name} added to cart`, 'info');
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding to cart. Please try again.");
    }
  });
}

/* PROFILE DROPDOWN */
const profileToggle = document.querySelector(".profile-toggle");
const profileEl = document.querySelector(".profile");

if (profileToggle) {
  profileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    profileEl.classList.toggle("active");
    notificationDropdown.classList.remove('show');
    cartDropdown.classList.remove('show');
  });
}

/* CART DROPDOWN */
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
      <img src="${item.img}" alt="${item.name}" class="cart-thumb">
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

/* DOWNLOAD VOUCHER BUTTON */
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

/* LOGOUT */
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

/* CLOSE MODALS */
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
  cartModal.style.display = "none";
};

document.getElementById("goToCartBtn").onclick = () => {
  window.location.href = "cart.html";
};