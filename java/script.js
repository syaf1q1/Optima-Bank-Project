const fields = {
  firstName: {
    el: document.getElementById("firstName"),
    validate: v => v.trim() !== "",
    msg: "Please enter your first name"
  },
  lastName: {
    el: document.getElementById("lastName"),
    validate: v => v.trim() !== "",
    msg: "Please enter your last name"
  },
  email: {
    el: document.getElementById("email"),
    validate: v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()),
    msg: "Please enter a valid email address"
  },
  phone: {
    el: document.getElementById("phone"),
    validate: v => /^[0-9]{8,15}$/.test(v.trim()),
    msg: "Please enter a valid phone number"
  },
  password: {
    el: document.getElementById("password"),
    validate: v => v.length >= 6,
    msg: "Password must be at least 6 characters"
  },
  confirmPassword: {
    el: document.getElementById("confirmPassword"),
    validate: v => v === document.getElementById("password").value && v !== "",
    msg: "Passwords do not match"
  }
};

function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    icon.src = "icons8-hide-90.png";
  } else {
    input.type = "password";
    icon.src = "icons8-eye-90.png";
  }
}

function showError(input, message) {
  const span = input.parentElement.querySelector(".error-message");
  span.textContent = message;
  span.style.display = "flex";
  input.classList.add("error");
}

function clearError(input) {
  const span = input.parentElement.querySelector(".error-message");
  span.style.display = "none";
  input.classList.remove("error");
}

// Validate only after blur
Object.values(fields).forEach(field => {
  field.el.addEventListener("blur", () => {
    if (!field.validate(field.el.value)) {
      showError(field.el, field.msg);
    } else {
      clearError(field.el);
    }
  });

  field.el.addEventListener("input", () => {
    if (field.validate(field.el.value)) {
      clearError(field.el);
    }
  });
});

// Final validation on submit
document.getElementById("signupForm").addEventListener("submit", e => {
  e.preventDefault();
  let valid = true;
  Object.values(fields).forEach(field => {
    if (!field.validate(field.el.value)) {
      showError(field.el, field.msg);
      valid = false;
    }
  });
  if (valid) {
    alert("✅ Account created successfully!");
    window.location.href = "index.html";
  }
});
