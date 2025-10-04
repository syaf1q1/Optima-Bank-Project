import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

let loggedInUserId = null;
let currentUserData = null;
let cartData = [];
let notifications = [];

const nameEl = document.getElementById("loggedInUserName");
const pointsEl = document.getElementById("loggedInUserPoints");
const rewardPointsSection = document.getElementById("loggedInUserPointsSection");
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

function updateUI(userData) {
  if (nameEl) nameEl.innerText = userData.firstName || userData.name || "User";
  if (pointsEl) pointsEl.innerText = `Balance Points: ${userData.points ?? 0}`;
  if (rewardPointsSection) rewardPointsSection.innerText = userData.points ?? 0;
}

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
  if (!loggedInUserId) return;
  
  try {
    const userRef = doc(db, "users", loggedInUserId);
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
  if (!loggedInUserId) return;
  
  try {
    const userRef = doc(db, "users", loggedInUserId);
    await updateDoc(userRef, { notifications: notifications });
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

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

async function updateUserPoints(pointsToAdd) {
  if (!loggedInUserId || !currentUserData) return;
  const userRef = doc(db, "users", loggedInUserId);
  const newPoints = (currentUserData.points || 0) + pointsToAdd;
  await updateDoc(userRef, { points: newPoints });
  currentUserData.points = newPoints;
  updateUI(currentUserData);
  addNotification(`You earned +${pointsToAdd} points!`, 'success');
}

const profileToggle = document.querySelector(".profile-toggle");
const profileEl = document.querySelector(".profile");

if (profileToggle && profileEl) {
  profileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    profileEl.classList.toggle("active");
  });
}

window.addEventListener("click", (e) => {
  if (notificationBtn && !notificationBtn.contains(e.target)) {
    notificationDropdown.classList.remove('show');
  }
  if (cartBtn && !cartBtn.contains(e.target)) {
    cartDropdown.classList.remove('show');
  }
  if (profileEl && !profileEl.contains(e.target)) {
    profileEl.classList.remove("active");
  }
  document.querySelectorAll(".modal").forEach(modal => {
    if (e.target === modal) modal.style.display = "none";
  });
});

const watchAdsBtn = document.getElementById("watchAdsBtn");
const adsModal = document.getElementById("adsModal");
const closeAdsModal = document.getElementById("closeAdsModal");
const adsVideo = document.getElementById("adsVideo");

const adVideos = [
  "video/IphoneAds.mp4",
  "video/ClearManAds.mp4",
  "video/CRAds.mp4",
  "video/MiloAds.mp4",
  "video/NikeAds.mp4",
  "video/PanteenAds.mp4",
  "video/PumaAds.mp4",
  "video/shopeeAds.mp4",
  "video/TrivagoAds.mp4",
  "video/UniqloAds.mp4",
];

function getRandomAd() {
  return adVideos[Math.floor(Math.random() * adVideos.length)];
}

if (watchAdsBtn) {
  watchAdsBtn.addEventListener("click", () => {
    adsVideo.src = getRandomAd();
    adsModal.style.display = "flex";
    adsVideo.currentTime = 0;
    adsVideo.play();
  });
}

if (closeAdsModal) {
  closeAdsModal.addEventListener("click", () => {
    const confirmClose = confirm("Close ad? No points awarded.");
    if (confirmClose) {
      adsModal.style.display = "none";
      adsVideo.pause();
    }
  });
}

if (adsVideo) {
  adsVideo.addEventListener("ended", async () => {
    await updateUserPoints(10);
    alert("You earned +10 points!");
    adsModal.style.display = "none";
  });
}

const totalCards = 20;
const cardsPerDay = 5;

const cardImages = [
  "img/shirt-adidas.jpeg",
  "img/shirt-adidas1.jpg",
  "img/hoodie.jpg",
  "img/creating-the-unreal-how-nike-made-its-wildest-air-footwear-yet.jpg",
  "img/Scuderia-Ferrari-HP-Speedcat-Sneakers-Women.jpeg",
  "img/nike-just-do-it.png",
  "img/Palermo-Leather-Sneakers-Unisex.jpeg",
  "img/bracelet.jpg",
  "img/bag urban vogue.jpg",
  "img/hoodie (1).jpg",
  "img/spect.jpg",
  "img/Sketch_Linear_Graphic_Tee_Black_HK9175_21_model.jpg",
  "img/adidas-6790-2395014-5.jpg",
  "img/AS+W+NSW+SS+TEE+LBR+OS+GCEL.png",
  "img/AS+M+NSW+TEE+12MO+SWOOSH+SP24.png",
  "img/AS+M+NK+DF+TEE+SL+SWOOSH.png",
  "img/27476580_57991445_600.jpg",
  "img/images (1).jpeg",
  "img/images.jpeg",
  "img/T7-ALWAYS-ON-Relaxed-Track-Pants-Men.jpeg"
];

function getDayIndex() {
  const today = new Date();
  const dayNumber = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
  return dayNumber % (totalCards / cardsPerDay);
}

function getTodayCards() {
  const dayIndex = getDayIndex();
  const start = dayIndex * cardsPerDay;
  return Array.from({ length: cardsPerDay }, (_, i) => start + i);
}

const dailyCardContainer = document.getElementById("dailyCardContainer");

async function renderDailyCards() {
  if (!currentUserData) return;
  const todayCards = getTodayCards();
  const today = new Date().toDateString();
  const claimed = currentUserData.dailyClaimed?.[today] || [];

  dailyCardContainer.innerHTML = "";

  todayCards.forEach((cardId) => {
    const cardEl = document.createElement("div");
    const alreadyClaimed = claimed.includes(cardId);

    cardEl.className = "daily-card";
    cardEl.innerHTML = `
      <img src="${cardImages[cardId]}" alt="Card ${cardId + 1}">
      <p>Card ${cardId + 1}</p>
      <p>+50 Points</p>
      <button class="claim-btn" ${alreadyClaimed ? "disabled" : ""}>
        ${alreadyClaimed ? "Claimed" : "Claim"}
      </button>
    `;

    const btn = cardEl.querySelector(".claim-btn");
    btn.addEventListener("click", async () => {
      if (alreadyClaimed) {
        alert("Already claimed this card today!");
        return;
      }
      await updateUserPoints(50);

      const userRef = doc(db, "users", loggedInUserId);
      const updatedClaimed = [...claimed, cardId];
      await updateDoc(userRef, {
        [`dailyClaimed.${today}`]: updatedClaimed
      });
      currentUserData.dailyClaimed = {
        ...currentUserData.dailyClaimed,
        [today]: updatedClaimed
      };
      renderDailyCards();
    });

    dailyCardContainer.appendChild(cardEl);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loggedInUserId = user.uid;
    const userRef = doc(db, "users", loggedInUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      currentUserData = userSnap.data();
      updateUI(currentUserData);
      renderDailyCards();
      updateCartUI(currentUserData.cart || []);
      loadNotifications();
    } else {
      console.log("No user data found");
    }
  } else {
    window.location.href = "signIn.html";
  }
});

const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogout = document.getElementById("confirmLogout");
const cancelLogout = document.getElementById("cancelLogout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logoutModal.style.display = "flex";
  });
}

if (cancelLogout) {
  cancelLogout.addEventListener("click", () => {
    logoutModal.style.display = "none";
  });
}

if (confirmLogout) {
  confirmLogout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "signIn.html";
  });
}

const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const closeChatbot = document.getElementById("closeChatbot");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendMessage = document.getElementById("sendMessage");
const quickReplyBtns = document.querySelectorAll(".quick-reply-btn");

if (chatbotToggle) {
  chatbotToggle.addEventListener("click", () => {
    if (chatbotWindow.style.display === "none" || chatbotWindow.style.display === "") {
      chatbotWindow.style.display = "flex";
      chatInput.focus();
    } else {
      chatbotWindow.style.display = "none";
    }
  });
}

if (closeChatbot) {
  closeChatbot.addEventListener("click", () => {
    chatbotWindow.style.display = "none";
  });
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "bot-message typing-indicator-container";
  typingDiv.id = "typingIndicator";
  
  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) {
    indicator.remove();
  }
}

function addMessage(text, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = isUser ? "user-message" : "bot-message";
  
  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isUser ? "user" : "bot"}`;
  bubble.textContent = text;
  
  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(question) {
  const q = question.toLowerCase();
  
  if (q.match(/\b(hello|hi|hey|good morning|good afternoon|good evening|greetings)\b/)) {
    const greetings = [
      "Hello! How can I assist you with your Optima Bank rewards today?",
      "Hi there! What can I help you with?",
      "Hey! Welcome to Optima Bank. How may I help you?",
      "Greetings! I'm here to help with your rewards and points!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (q.match(/\b(earn|get|collect|gain|acquire)\b.*\b(point|reward)\b/) || q.includes("how") && q.includes("point")) {
    return `You can earn points in multiple ways:\n\nWatch Ads: +10 points per ad\nDaily Cards: Claim 5 cards daily for +50 points each\nShopping: Earn points on purchases with your Optima Bank card\nSpecial Promotions: Check our deals section regularly\n\nStart earning today!`;
  }
  
  if (q.match(/\b(redeem|spend|use|buy|purchase|exchange)\b/) || q.includes("voucher") || q.includes("reward")) {
    return `You can redeem amazing vouchers from top brands:\n\nAdidas - 1200 points\nNike - 1500 points\nUrban Vogue - 800 points\nPuma - 1000 points\n\nBrowse the Promotions section to see all available deals!`;
  }
  
  if (q.match(/\b(balance|how many|check|current)\b.*\b(point|reward)\b/) || q === "balance" || q === "points") {
    const points = currentUserData?.points ?? 0;
    const userName = currentUserData?.firstName || currentUserData?.name || "there";
    return `Hi ${userName}!\n\nYour current balance: ${points} points\n\n${points < 500 ? "Keep collecting to unlock more rewards!" : 
       points < 1000 ? "Great progress! You're close to redeeming premium items!" :
       "Awesome! You have enough points for premium rewards!"}`;
  }
  
  if (q.match(/\b(daily|card|claim)\b/)) {
    return `Daily Cards Info:\n\n5 new cards available every day\nEach card = 50 points\nCards refresh at midnight\nDon't miss out on easy points!\n\nCheck the Daily Cards section below to claim yours!`;
  }
  
  if (q.match(/\b(cart|checkout|order|buy)\b/)) {
    const cartCount = cartData?.length || 0;
    return `Cart & Checkout:\n\nCurrent items in cart: ${cartCount}\n\nTo checkout:\n1. Click the Cart icon in the header\n2. Review your selected items\n3. Click checkout to redeem with points\n\n${cartCount === 0 ? "Your cart is empty. Browse promotions to add items!" : "Ready to checkout? Click the cart icon!"}`;
  }
  
  if (q.match(/\b(ad|ads|video|watch|commercial)\b/)) {
    return `Watch Ads Feature:\n\nClick "Watch Ads" button below\nWatch a short sponsored video\nEarn +10 points instantly\nNew ads available frequently\n\nEasy points for minimal time!`;
  }
  
  if (q.match(/\b(account|profile|info|detail)\b/)) {
    const userName = currentUserData?.firstName || currentUserData?.name || "User";
    const points = currentUserData?.points ?? 0;
    return `Your Account Info:\n\nName: ${userName}\nPoints Balance: ${points}\n\nTo manage your account, click your profile picture in the header.`;
  }
  
  if (q.match(/\b(help|support|assist|guide|how to)\b/)) {
    return `I can help you with:\n\nEarning points\nRedeeming vouchers\nChecking balance\nDaily cards\nCart & checkout\nAccount information\nWatching ads\n\nJust ask me anything!`;
  }
  
  if (q.match(/\b(thank|thanks|appreciate|awesome|great|perfect)\b/)) {
    const responses = [
      "You're welcome! Happy to help!",
      "Anytime! Enjoy your Optima Bank rewards!",
      "My pleasure! Let me know if you need anything else!",
      "Glad I could help! Have a great day!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (q.match(/\b(bye|goodbye|see you|later|exit)\b/)) {
    return "Goodbye! Come back anytime you need help with your rewards!";
  }
  
  if (q.match(/\b(contact|support|email|phone|call)\b/)) {
    return `Contact Support:\n\nFor additional assistance:\nEmail: support@optimabank.com\nPhone: 1-800-OPTIMA\nHours: Mon-Fri, 9AM-6PM\n\nI'm here 24/7 for quick questions!`;
  }
  
  const defaultResponses = [
    "I'm not sure about that. Could you rephrase your question?",
    "Hmm, I didn't quite understand. Try asking about earning points, redeeming rewards, or checking your balance!",
    "I'm here to help with Optima Bank rewards! Ask me about points, vouchers, or your account.",
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)] + 
         "\n\nPopular topics:\nHow do I earn points?\nWhat can I redeem?\nCheck my balance";
}

function handleSendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  
  sendMessage.disabled = true;
  chatInput.disabled = true;
  
  addMessage(message, true);
  chatInput.value = "";
  
  showTypingIndicator();
  
  const responseDelay = 800 + Math.random() * 700;
  
  setTimeout(() => {
    removeTypingIndicator();
    const response = getBotResponse(message);
    addMessage(response, false);
    
    sendMessage.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }, responseDelay);
}

if (sendMessage) {
  sendMessage.addEventListener("click", handleSendMessage);
}

if (chatInput) {
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });
}

quickReplyBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const question = btn.getAttribute("data-question");
    addMessage(question, true);
    
    showTypingIndicator();
    
    setTimeout(() => {
      removeTypingIndicator();
      const response = getBotResponse(question);
      addMessage(response, false);
    }, 800);
  });
});

setTimeout(() => {
  if (currentUserData && chatMessages.children.length === 1) {
    const userName = currentUserData.firstName || currentUserData.name || "";
    if (userName) {
      addMessage(`Welcome back, ${userName}! How can I assist you today?`, false);
    }
  }
}, 2000);