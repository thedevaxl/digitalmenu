export async function logout() {
  const res = await fetch("/api/user?action=logout", {
    method: "POST",
  });

  if (res.ok) {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirect to login page after logout
  } else {
    console.error("Failed to logout");
  }
}
