async function checkUserLoginForm() {
  const res = await fetch('https://aviralifecare.com/user/login');
  const html = await res.text();
  console.log("Length:", html.length);
  const inputs = html.match(/<input[^>]*>/gi);
  console.log("Inputs on /user/login:\n", inputs);
  const form = html.match(/<form[^>]*>/gi);
  console.log("Form tags:\n", form);
}

checkUserLoginForm();
