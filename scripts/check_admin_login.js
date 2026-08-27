async function checkAdminLogin() {
  const res = await fetch('https://aviralifecare.com/admin/login');
  const html = await res.text();
  console.log("Admin Login Length:", html.length);
  const inputs = html.match(/<input[^>]*>/gi);
  console.log("Admin Login Inputs:\n", inputs);
  const form = html.match(/<form[^>]*>/gi);
  console.log("Admin Login Form:\n", form);
}

checkAdminLogin();
