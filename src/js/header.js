export async function loadHeader() {
  const headerElement = document.querySelector(".site-header");
  if (!headerElement) return;

  try {
    const response = await fetch("/header.html");
    const html = await response.text();
    headerElement.innerHTML = html;
  } catch (error) {
    console.error("Could not load header:", error);
  }
}