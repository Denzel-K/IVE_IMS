const signinPasswordInput = document.getElementById("signinPassword");
const signupPasswordInput = document.getElementById("signupPassword");
const newPasswordInput = document.getElementById("newPassword");
const toggleSignupPassword = document.getElementById("toggleSignupPassword");
const toggleSigninPassword = document.getElementById("toggleSigninPassword");
const toggleNewPassword = document.getElementById("toggleNewPassword");

toggleSignupPassword.addEventListener("click", function () {
  if (signupPasswordInput.type === "password") {
    signupPasswordInput.type = "text";
    toggleSignupPassword.src = "assets/icons/hide.svg";
  } else {
    signupPasswordInput.type = "password";
    toggleSignupPassword.src = "assets/icons/show.svg"; 
  }
});

toggleSigninPassword.addEventListener("click", function () {
  if (signinPasswordInput.type === "password") {
    signinPasswordInput.type = "text";
    toggleSigninPassword.src = "assets/icons/hide.svg";
  } else {
    signinPasswordInput.type = "password";
    toggleSigninPassword.src = "assets/icons/show.svg";
  }
});

toggleNewPassword.addEventListener("click", function () {
  if (newPasswordInput.type === "password") {
    newPasswordInput.type = "text";
    toggleNewPassword.src = "assets/icons/hide.svg";
  } else {
    newPasswordInput.type = "password";
    toggleNewPassword.src = "assets/icons/show.svg";
  }
});

const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  const loginForm = document.getElementById("login_form");
  loginForm.reset();

  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  const regForm = document.getElementById("reg_form");
  regForm.reset();

  container.classList.remove("sign-up-mode");
});

// Custom role options/dropdown
const dropdownroles = document.querySelector('.dropdownroles');
const roleOptions = document.querySelector('.role_options');
const roleInput = document.querySelector('input[name="role"]');
const roleOptionItems = document.querySelectorAll('.role_opt');

// Toggle the dropdown menu on click
dropdownroles.addEventListener('click', () => {
  roleOptions.classList.toggle('hidden');
  dropdownroles.classList.toggle('dropped');
});

// Update the input field when a role is selected
roleOptionItems.forEach(option => {
  option.addEventListener('click', function () {
    roleInput.value = this.textContent; 
    roleOptions.classList.add('hidden');
    dropdownroles.classList.remove('dropped'); 
  });
});

// Custom lab options/dropdown
const dropdownlabs = document.querySelector('.dropdownlabs');
const labOptions = document.querySelector('.lab_options');
const labInput = document.querySelector('input[name="lab"]');
const labOptionItems = document.querySelectorAll('.lab_opt');

// Toggle the dropdown menu on click
dropdownlabs.addEventListener('click', () => {
  labOptions.classList.toggle('hidden');
  dropdownlabs.classList.toggle('dropped');
});

// Update the input field when a role is selected
labOptionItems.forEach(option => {
  option.addEventListener('click', function () {
    labInput.value = this.textContent; 
    labOptions.classList.add('hidden');
    dropdownlabs.classList.remove('dropped'); 
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
  const lab = regForm.lab.value.trim();
  const password = regForm.password.value.trim();
  const errorsDiv = regForm.querySelector(".signup_errors");

  // Ensure strig consistency for lab
  let newLab;
  if (lab == "Design Studio"){
    newLab = "design_studio";
  }
  else if (lab == "Cezeri"){
    newLab = "cezeri";
  }
  else if (lab == "MedTech"){
    newLab = "medtech";
  }

  // Ensure strig consistency for role
  let newRole;
  if (role == "Lab Manager"){
    newRole = "lab_manager";
  }
  else if (role == "Student"){
    newRole = "student";
  }
  else if (role == "Technician"){
    newRole = "technician";
  }


  let errors = [];

  // Validation checks
  if (name.length < 2) errors.push("Full name must be at least 2 characters.");
  if (!isValidEmail(email)) errors.push("Invalid email address.");
  if (!isValidPhone(phone)) errors.push("Invalid phone number (Use +2547XXXXXXXX or 07XXXXXXXX).");
  if (role === "") errors.push("Please select a role.");
  if (lab === "") errors.push("Please select a lab.");
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
      body: JSON.stringify({ name, email, phone, password, lab: newLab, role: newRole }),
    });

    const data = await response.json();
    if (!response.ok){
      console.log("Registration failed.");
      throw new Error(data.message || "Registration failed.");
    }
    regForm.reset(); // Clear form
    window.location.href = "/dashboardGet";
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
    window.location.href = "/dashboardGet"; 
  } 
  catch (error) {
    displayErrors(errorsDiv, [error.message]);
  }
});


// Reset pasword modal
const init_pass_reset = document.querySelector('#init-pass-reset');
const pass_reset_modal = document.querySelector('.pass_reset_modal');
const close_pass_reset = document.querySelector('#close-pass-reset');
const reset_pass_form = document.querySelector('#reset_pass_form');

init_pass_reset.addEventListener('click', () => {
  pass_reset_modal.classList.remove('hidden');
});

close_pass_reset.addEventListener('click', () => {
  reset_pass_form.reset();
  pass_reset_modal.classList.add('hidden');
});