const signinPasswordInput = document.getElementById("signinPassword");
const signupPasswordInput = document.getElementById("signupPassword");
const toggleSignupPassword = document.getElementById("toggleSignupPassword");
const toggleSigninPassword = document.getElementById("toggleSigninPassword");

toggleSignupPassword.addEventListener("click", function () {
  if (signupPasswordInput.type === "password") {
    signupPasswordInput.type = "text";
    toggleSignupPassword.src = "assets/icons/hide.svg"; // Switch to hide icon
  } else {
    signupPasswordInput.type = "password";
    toggleSignupPassword.src = "assets/icons/show.svg"; // Switch back to show icon
  }
});

toggleSigninPassword.addEventListener("click", function () {
  if (signinPasswordInput.type === "password") {
    signinPasswordInput.type = "text";
    toggleSigninPassword.src = "assets/icons/hide.svg"; // Switch to hide icon
  } else {
    signinPasswordInput.type = "password";
    toggleSigninPassword.src = "assets/icons/show.svg"; // Switch back to show icon
  }
});


const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Custom options/dropdown
const dropdown = document.querySelector('.dropdown');
const roleOptions = document.querySelector('.role_options');
const roleInput = document.querySelector('input[name="role"]');
const roleOptionItems = document.querySelectorAll('.role_opt');

// Toggle the dropdown menu on click
dropdown.addEventListener('click', () => {
  roleOptions.classList.toggle('hidden');
  dropdown.classList.toggle('dropped');
});

// Update the input field when a role is selected
roleOptionItems.forEach(option => {
  option.addEventListener('click', function () {
    roleInput.value = this.textContent; 
    roleOptions.classList.add('hidden');
    dropdown.classList.remove('dropped'); 
  });
});


// Form submission
const loginForm = document.getElementById("login_form");
const regForm = document.getElementById("reg_form");

// Function to validate email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Function to validate phone number (Kenyan format: +2547XXXXXXXX or 07XXXXXXXX)
const isValidPhone = (phone) => /^(\+2547\d{8}|07\d{8})$/.test(phone);

// Function to validate password (Minimum 6 characters)
const isValidPassword = (password) => password.length >= 6;

// Function to display error messages
const displayErrors = (element, errors) => {
  element.innerHTML = ""; // Clear existing errors
  errors.forEach((error) => {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("error-message");
    errorDiv.textContent = error;
    element.appendChild(errorDiv);
  });
};

// Register Form Submission**
regForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = regForm.name.value.trim();
  const email = regForm.email.value.trim();
  const phone = regForm.phone.value.trim();
  const role = regForm.role.value.trim();
  const password = regForm.password.value.trim();
  const errorsDiv = regForm.querySelector(".signup_errors");

  let errors = [];

  // Validation checks
  if (name.length < 2) errors.push("Full name must be at least 2 characters.");
  if (!isValidEmail(email)) errors.push("Invalid email address.");
  if (!isValidPhone(phone)) errors.push("Invalid phone number (Use +2547XXXXXXXX or 07XXXXXXXX).");
  if (role === "") errors.push("Please select a role.");
  if (!isValidPassword(password)) errors.push("Password must be at least 6 characters.");

  if (errors.length > 0) {
    displayErrors(errorsDiv, errors);
    return;
  }

  // Send data to backend
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, role }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed.");

    regForm.reset(); // Clear form
    window.location.href = "/dashboard";
  } 
  catch (error) {
    displayErrors(errorsDiv, [error.message]);
  }
});

// Login Form Submission**
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector("input[type='email']").value.trim();
  const password = loginForm.querySelector("#signinPassword").value.trim();
  const errorsDiv = loginForm.querySelector(".signup_errors");

  let errors = [];

  // Validation checks
  if (!isValidEmail(email)) errors.push("Invalid email format.");
  if (!isValidPassword(password)) errors.push("Password must be at least 6 characters.");

  if (errors.length > 0) {
    displayErrors(errorsDiv, errors);
    return;
  }

  // Send data to backend
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed.");

    loginForm.reset(); // Clear form
    window.location.href = "/dashboard"; 
  } 
  catch (error) {
    displayErrors(errorsDiv, [error.message]);
  }
});