// Sidebar opening/closing
const toggler = document.querySelector('.toggler');

toggler.addEventListener('click', () => {
  document.querySelector('.skeleton').classList.toggle('active');
})


// Style current page link
const pageLinks = document.querySelectorAll(".page_link");
const currentPath = window.location.pathname;

pageLinks.forEach(link => {
  if (link.getAttribute("href") === currentPath) {
    link.classList.add("curr_page");
  }
});

// Profile Dropdown
const dropdownBtn = document.querySelector(".dropdown-btn");
const pBoxReveal = document.querySelector(".p-box-reveal");

dropdownBtn.addEventListener("click", () => {
  pBoxReveal.classList.toggle("hidden");
  dropdownBtn.classList.toggle("spin");
});