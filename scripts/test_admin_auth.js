async function testAdminLoginAuth(email, password) {
  console.log(`Testing admin login with ${email}...`);
  const getRes = await fetch("https://aviralifecare.com/admin/login");
  const getCookies = getRes.headers.getSetCookie ? getRes.headers.getSetCookie() : [getRes.headers.get("set-cookie")];
  const cookieStr = getCookies.map(c => c ? c.split(';')[0] : '').join('; ');
  const html = await getRes.text();
  const tokenMatch = html.match(/name="_token"\s+value="([^"]+)"/);
  const csrfToken = tokenMatch ? tokenMatch[1] : '';

  const params = new URLSearchParams();
  params.append('_token', csrfToken);
  params.append('email', email);
  params.append('password', password);

  const postRes = await fetch("https://aviralifecare.com/admin/storeLogin", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieStr,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://aviralifecare.com/admin/login"
    },
    redirect: "manual"
  });

  console.log("Status:", postRes.status, "Location:", postRes.headers.get("location"));
  const postCookies = postRes.headers.getSetCookie ? postRes.headers.getSetCookie() : [postRes.headers.get("set-cookie")];
  console.log("Post cookies:", postCookies);
}

testAdminLoginAuth('zipzan143@gmail.com', '156951');
