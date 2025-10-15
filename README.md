# Optima Bank - Rewards & Vouchers Platform

A comprehensive web application for Optima Bank customers to manage reward points, redeem vouchers, and shop for brand products.

## 🚀 Features

### 🔐 Authentication & User Management
- **Secure Login/Registration** with Firebase Authentication
- **Human Verification** with CAPTCHA system
- **Google OAuth Integration** for seamless sign-in
- **Profile Management** with editable user information

### 💰 Rewards System
- **Points Balance Tracking** across all pages
- **Points Collection** through watching ads (+10 points per ad)
- **Real-time Balance Updates** with Firebase Firestore

### 🛍️ Voucher & Shopping Experience
- **Voucher Catalog** with brand products (Adidas, Nike, Puma, Urban Vogue)
- **Detailed Voucher Pages** with full product information
- **Shopping Cart** with add/remove functionality
- **One-click Redemption** with points validation

### 📱 User Interface
- **Responsive Design** optimized for desktop and mobile
- **Consistent Header** with navigation across all pages
- **Interactive Modals** for actions and confirmations
- **Professional Styling** with Optima Bank branding

### 🔔 Notification System
- **Real-time Notifications** for cart updates, redemptions, and downloads
- **Notification Badge** with unread count
- **Clear All** functionality
- **Persistent Storage** across sessions

### 📄 Document Generation
- **PDF Voucher Generation** with QR codes
- **Text-based Voucher Download** fallback
- **Professional Voucher Templates** with bank branding

## 🏗️ Project Structure

```
optima-bank/
├── html/
│   ├── landingpage.html          # Home dashboard
│   ├── signIn.html              # Login page
│   ├── createAccount.html       # Registration page
│   ├── vochercat.html          # Voucher categories
│   ├── vocherinfo.html         # Individual voucher details
│   ├── cart.html               # Shopping cart
│   ├── historyreddemed.html    # Redemption history
│   ├── MyAccount.html          # User profile management
│   └── terms.html              # Terms and conditions
├── static/                     # CSS stylesheets
├── java/                      # JavaScript modules
└── img/                       # Images and icons
```

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication, Firestore)
- **PDF Generation**: jsPDF + QRCode.js
- **Icons**: Custom icons and Font Awesome
- **Fonts**: Google Fonts (Inter)
- **Hosting**: Firebase Hosting compatible

## 🔧 Setup Instructions

### Prerequisites
- Firebase project with Authentication and Firestore enabled
- Web server for local development

### Installation
1. Clone the repository
2. Update Firebase configuration in each HTML file:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

3. Deploy to your preferred hosting service

### Firebase Setup
1. Enable Email/Password authentication
2. Enable Google authentication (optional)
3. Set up Firestore database with collections:
   - `users` (for user data, points, cart, notifications)
   - `vouchers` (for product/voucher information)
   - `redeemed` (subcollection under users for redemption history)

## 📱 Pages Overview

### 🏠 Landing Page (`landingpage.html`)
- Points balance display
- Promotion cards
- Daily reward cards
- Watch ads for points feature
- Integrated chatbot assistant

### 🔐 Authentication Pages
- **Sign In** (`signIn.html`): Login with email/password or Google
- **Create Account** (`createAccount.html`): New user registration

### 🛍️ Shopping Pages
- **Voucher Catalog** (`vochercat.html`): Browse available vouchers
- **Voucher Details** (`vocherinfo.html`): Individual product pages
- **Shopping Cart** (`cart.html`): Manage cart items and redeem

### 👤 User Management
- **My Account** (`MyAccount.html`): Profile editing and management
- **Redemption History** (`historyreddemed.html`): Track past redemptions
- **Terms & Conditions** (`terms.html`): Platform rules and guidelines

## 🎨 Design Features

- **Color Scheme**: Purple (#8C1A6A) and pink (#FCECF3) brand colors
- **Typography**: Inter font family for modern readability
- **Responsive**: Mobile-first design with breakpoints at 576px and 768px
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Loading States**: Spinners and skeleton screens for better UX

## 🔒 Security Features

- Firebase Authentication with email verification
- CAPTCHA protection against bots
- Input validation and sanitization
- Secure session management
- Protected routes requiring authentication

## 📈 Future Enhancements

- [ ] Push notifications
- [ ] Advanced filtering and search
- [ ] Wishlist functionality
- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is proprietary property of Optima Bank.

## 🆘 Support

For support and questions:
- Email: support@optimabank.com
- Documentation: [Link to documentation]
- Issue Tracker: [Link to issues]

---

**Built with ❤️ for Optima Bank Customers**
