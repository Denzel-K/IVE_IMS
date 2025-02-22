// Sidebar opening/closing
const toggler = document.querySelector('.toggler');

toggler.addEventListener('click', () => {
  document.querySelector('.skeleton').classList.toggle('active');
})

// Dropdown
const dropdownBtn = document.querySelector(".dropdown-btn");
const pBoxReveal = document.querySelector(".p-box-reveal");

dropdownBtn.addEventListener("click", () => {
  pBoxReveal.classList.toggle("hidden");
  dropdownBtn.classList.toggle("spin");
});