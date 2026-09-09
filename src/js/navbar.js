export async function initNavbar() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  try {
    const response = await fetch("navbar.html");
    const html = await response.text();
    nav.innerHTML = html;
  } catch (error) {
    console.error("Could not load navbar:", error);
  }
}