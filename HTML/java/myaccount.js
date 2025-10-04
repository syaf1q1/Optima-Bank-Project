    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
    import { 
      getAuth, 
      onAuthStateChanged, 
      signOut, 
      updateEmail, 
      updatePassword,
      reauthenticateWithCredential,
      EmailAuthProvider
    } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
    import { 
      getFirestore, 
      doc, 
      getDoc, 
      updateDoc,
      setDoc
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
    const loadingSpinner = document.getElementById("loadingSpinner");
    const profileCard = document.getElementById("profileCard");

    /* ========== STATE ========== */
    let balance = 0;
    let currentUserId = null;
    let cartData = [];
    let notifications = [];
    let currentUserData = {};
    let originalUserData = {};

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

    if (notificationBtn) {
      notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('show');
        if (cartDropdown) cartDropdown.classList.remove('show');
        notifications.forEach(n => n.unread = false);
        updateNotificationUI();
        saveNotifications();
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        notifications = [];
        updateNotificationUI();
        saveNotifications();
      });
    }

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
      cartData = cart || [];
      cartItemsEl.innerHTML = "";

      if (!cart || cart.length === 0) {
        emptyCartMsg.style.display = "block";
        cartCountEl.textContent = 0;
        return;
      }

      emptyCartMsg.style.display = "none";
      cartCountEl.textContent = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

      cart.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("cart-item");
        li.innerHTML = `
          <img src="img/${item.img || 'placeholder.png'}" alt="${item.name || 'Item'}" class="cart-thumb" onerror="this.src='img/download.png'">
          <div class="cart-info">
            <p class="cart-name">${item.name || 'Unnamed Item'}</p>
            <p class="cart-qty">${item.price || 0} pts × ${item.qty || 1}</p>
          </div>
        `;
        cartItemsEl.appendChild(li);
      });
    }

    if (cartBtn) {
      cartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        cartDropdown.classList.toggle("show");
        if (notificationDropdown) notificationDropdown.classList.remove('show');
      });
    }

    /* ========== PROFILE DATA LOADING ========== */
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const firstNameInput = document.getElementById("editFirstName");
    const lastNameInput = document.getElementById("editLastName");
    const emailInput = document.getElementById("editEmail");
    const phoneInput = document.getElementById("editPhone");
    const passwordInput = document.getElementById("editPassword");

    async function loadUserData(user) {
      try {
        loadingSpinner.classList.add('show');
        profileCard.style.display = 'none';

        const docRef = doc(db, "users", user.uid);
        console.log("Fetching user document for:", user.uid);
        
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("User data fetched:", data);
          
          currentUserData = data;
          originalUserData = { ...data };
          
          // Update header
          if (nameEl) nameEl.textContent = data.firstName || user.displayName || "User";
          balance = data.points || 0;
          if (pointsEl) pointsEl.textContent = `Balance Points: ${balance}`;
          
          // Update profile card
          const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "User Name";
          document.getElementById("cardUserName").textContent = fullName;
          document.getElementById("cardUserEmail").textContent = data.email || user.email || "-";

          // Fill input fields
          firstNameInput.value = data.firstName || "";
          lastNameInput.value = data.lastName || "";
          emailInput.value = data.email || user.email || "";
          phoneInput.value = data.phone || "";
          passwordInput.value = "";
          passwordInput.placeholder = "Enter new password (leave blank to keep current)";

          // Update cart and notifications
          updateCartUI(data.cart || []);
          await loadNotifications();

          loadingSpinner.classList.remove('show');
          profileCard.style.display = 'block';
        } else {
          console.warn("No user document found. Creating default document...");
          
          // Create default user document
          const defaultData = {
            email: user.email || "",
            firstName: user.displayName || "User",
            lastName: "",
            phone: "",
            points: 0,
            cart: [],
            notifications: [],
            createdAt: new Date().toISOString()
          };

          await setDoc(docRef, defaultData);
          console.log("Default user document created");
          
          // Reload the page to fetch the newly created document
          window.location.reload();
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        alert("Error loading profile data. Please refresh the page.");
        loadingSpinner.classList.remove('show');
      }
    }

    /* ========== AUTH STATE ========== */
    onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user);
      
      if (!user) {
        console.log("No user logged in, redirecting to signIn.html");
        window.location.href = "signIn.html";
        return;
      }

      currentUserId = user.uid;
      console.log("User logged in:", currentUserId);
      
      await loadUserData(user);
    });

    /* ========== EDIT PROFILE ========== */
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        console.log("Edit button clicked");
        [firstNameInput, lastNameInput, emailInput, phoneInput, passwordInput].forEach(el => el.disabled = false);
        saveBtn.disabled = false;
        cancelBtn.disabled = false;
        editBtn.disabled = true;
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        console.log("Cancel button clicked");
        firstNameInput.value = originalUserData.firstName || "";
        lastNameInput.value = originalUserData.lastName || "";
        emailInput.value = originalUserData.email || "";
        phoneInput.value = originalUserData.phone || "";
        passwordInput.value = "";

        [firstNameInput, lastNameInput, emailInput, phoneInput, passwordInput].forEach(el => el.disabled = true);
        saveBtn.disabled = true;
        cancelBtn.disabled = true;
        editBtn.disabled = false;
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        if (!currentUserId) {
          alert("No user logged in");
          return;
        }

        try {
          console.log("Saving profile changes...");
          const docRef = doc(db, "users", currentUserId);

          // Update Firestore
          const updateData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim()
          };

          console.log("Updating Firestore with:", updateData);
          await updateDoc(docRef, updateData);

          // Update email if changed
          if (auth.currentUser && emailInput.value.trim() !== originalUserData.email) {
            console.log("Email changed, updating Firebase Auth...");
            try {
              await updateEmail(auth.currentUser, emailInput.value.trim());
              console.log("Email updated successfully");
            } catch (emailError) {
              console.error("Email update error:", emailError);
              alert("Email updated in profile but you may need to re-login to update authentication email.");
            }
          }

          // Update password if provided
          if (auth.currentUser && passwordInput.value && passwordInput.value.trim() !== "") {
            console.log("Password change requested");
            if (passwordInput.value.length < 6) {
              alert("Password must be at least 6 characters");
              return;
            }
            try {
              await updatePassword(auth.currentUser, passwordInput.value);
              console.log("Password updated successfully");
            } catch (pwError) {
              console.error("Password update error:", pwError);
              alert("Password update failed. You may need to re-login first. Error: " + pwError.message);
              return;
            }
          }

          addNotification("Profile updated successfully!", "success");
          alert("Profile updated successfully!");
          
          // Reload to fetch fresh data
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (err) {
          console.error("Error updating profile:", err);
          alert("Failed to update profile: " + err.message);
        }
      });
    }

    /* ========== PROFILE DROPDOWN ========== */
    const profileToggle = document.querySelector(".profile-toggle");
    const profileEl = document.querySelector(".profile");

    if (profileToggle && profileEl) {
      profileToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        profileEl.classList.toggle("active");
        if (notificationDropdown) notificationDropdown.classList.remove('show');
        if (cartDropdown) cartDropdown.classList.remove('show');
      });
    }

    /* ========== CLOSE DROPDOWNS ON OUTSIDE CLICK ========== */
    window.addEventListener("click", (e) => {
      // Close notification dropdown if clicked outside
      if (notificationBtn && !notificationBtn.contains(e.target)) {
        notificationDropdown.classList.remove('show');
      }
      
      // Close cart dropdown if clicked outside
      if (cartBtn && !cartBtn.contains(e.target)) {
        cartDropdown.classList.remove('show');
      }
      
      // Close profile dropdown if clicked outside
      if (profileEl && !profileEl.contains(e.target)) {
        profileEl.classList.remove("active");
      }
      
      // Close modals if clicked on backdrop
      document.querySelectorAll(".modal").forEach(modal => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });
    });

    /* ========== LOGOUT ========== */
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        logoutModal.style.display = "flex";
      });
    }

    if (confirmLogout) {
      confirmLogout.addEventListener("click", () => {
        logoutModal.style.display = "none";
        signOut(auth).then(() => {
          console.log("User signed out");
          window.location.href = "signIn.html";
        }).catch((error) => {
          console.error("Sign out error:", error);
          alert("Error signing out: " + error.message);
        });
      });
    }

    if (cancelLogout) {
      cancelLogout.addEventListener("click", () => {
        logoutModal.style.display = "none";
      });
    }

    // Prevent form submission on Enter key
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });
    });

    console.log("MyAccount page script loaded successfully");
