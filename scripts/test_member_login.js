async function testMemberDirectLogin(memberId, password) {
  console.log(`Testing direct member login for ${memberId}...`);
  
  // Step 1: GET login page to get CSRF token and session cookie
  const getRes = await fetch("https://aviralifecare.com/user/login");
  const getCookies = getRes.headers.getSetCookie ? getRes.headers.getSetCookie() : [getRes.headers.get("set-cookie")];
  const cookieStr = getCookies.map(c => c ? c.split(';')[0] : '').join('; ');
  const html1 = await getRes.text();
  const tokenMatch = html1.match(/name="_token"\s+value="([^"]+)"/);
  const csrfToken = tokenMatch ? tokenMatch[1] : '';
  console.log("CSRF Token:", csrfToken, "Initial Cookie:", cookieStr);

  // Step 2: POST credentials
  const params = new URLSearchParams();
  params.append('_token', csrfToken);
  params.append('member_id', memberId);
  params.append('password', password);

  const postRes = await fetch("https://aviralifecare.com/user/storelogin", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieStr,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://aviralifecare.com/user/login"
    },
    redirect: "manual"
  });

  console.log("POST Status:", postRes.status, "Redirect Location:", postRes.headers.get("location"));
  const postCookies = postRes.headers.getSetCookie ? postRes.headers.getSetCookie() : [postRes.headers.get("set-cookie")];
  const authCookie = postCookies.map(c => c ? c.split(';')[0] : '').join('; ') || cookieStr;

  // Step 3: GET /user/home
  const homeRes = await fetch("https://aviralifecare.com/user/home", {
    headers: {
      "Cookie": authCookie,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  console.log("GET /user/home Status:", homeRes.status);
  const homeHtml = await homeRes.text();
  console.log("Home HTML length:", homeHtml.length);

  // Extract PV
  const leftPv = homeHtml.match(/Left\s*PV[\s\S]*?<td>\s*(\d+)\s*<\/td>/i) || homeHtml.match(/Left\s*PV[^\d]*(\d+)/i);
  const rightPv = homeHtml.match(/Right\s*PV[\s\S]*?<td>\s*(\d+)\s*<\/td>/i) || homeHtml.match(/Right\s*PV[^\d]*(\d+)/i);
  console.log(`Result for ${memberId}: Left PV =`, leftPv ? leftPv[1] : 'N/A', 'Right PV =', rightPv ? rightPv[1] : 'N/A');
}

testMemberDirectLogin('AV0001', '156951');
