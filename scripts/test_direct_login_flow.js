const token1 = "eyJpdiI6IlZlalVQclNQdEQ2ZW1aNWFoNVNmcEE9PSIsInZhbHVlIjoiajF4SC9QYXUxWlp5T1FXNjBNWVluV1Z3WHdjazBKYWh2Tk9hSlZOR0hpOVA1RWl5OVZaZlU1dys3bmtjNHJBMkplM2tUSnhPK2l0T1BkVXQyaG5tVktwWTQxYzdYWGc3Y3NIbW9VUWUwdm1OZE16eWR5eTlXa3oxZlU1ZGhtTUsiLCJtYWMiOiI2MjEzZGM4ZGMwZTdiOTZiZTVkZWZmNGQxYWMzNzFjNzUzMmY0MTdlMDhmOWZkYWU1YmJkNDk5MzFjNDYyZmZhIiwidGFnIjoiIn0%3D";
const token2 = "eyJpdiI6ImpIYWtZVkM5eDBOaFNuclo1TWpUcUE9PSIsInZhbHVlIjoiZHlVZEJTU2c0U3VOSDJmYmlCZWlVMGQrc2Y1cnZMOUZHQWdOTVczdlVFSWpjZjdBeWxZQ3hkL1lRZzlpOEhRM0NGOGtpMVZ3bEc2d2VYQXBSNXBtU3pGZXFkdUNaT0ZNRk81cTlsNVZJTDQ0NGlDRmhBZDRoaWRuUXdQWXhhYUwiLCJtYWMiOiI0MzRhNmNjNTFhMmI2NTQwMGQwMDIxMzY3NTIyZjhlZWYzOGY2NjExOTI1ODA0MmQzY2I3MmEwYzg0N2JhNThlIiwidGFnIjoiIn0%3D";

const adminCookie = `XSRF-TOKEN=${token2}; aviralifecare_session=${token1}`;

async function testDirectLogin() {
  const directLoginUrl = "https://aviralifecare.com/admin/direct-login/eyJpdiI6IkpHYllMQWFhZE1oaVlzNXdmL0pPTXc9PSIsInZhbHVlIjoickI3My9ybHdWRlFzSWVZNGVvK3lEQT09IiwibWFjIjoiNGFkMDU1ZTAxYzUzZWFkNDJiZjU5Y2IxMWFkYzg0OGNjZGZjZjVlMDJkZTc0YWNkZDgxNmY3MDE4YzQ2NDg4OSIsInRhZyI6IiJ9";

  console.log("Step 1: Hit direct-login with Admin cookie (manual redirect)...");
  const res1 = await fetch(directLoginUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Cookie": adminCookie
    },
    redirect: "manual"
  });

  console.log("Status:", res1.status, "Location:", res1.headers.get("location"));
  const setCookies = res1.headers.getSetCookie ? res1.headers.getSetCookie() : [res1.headers.get("set-cookie")];
  console.log("Set-Cookie headers from direct-login:", setCookies);

  // Extract the new member session cookie
  let memberCookie = "";
  if (setCookies) {
    memberCookie = setCookies.map(c => c ? c.split(';')[0] : '').join('; ');
  }
  console.log("Extracted member cookie:", memberCookie);

  console.log("\nStep 2: Fetch /user/home using member cookie...");
  const res2 = await fetch("https://aviralifecare.com/user/home", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Cookie": memberCookie
    }
  });

  console.log("/user/home status:", res2.status);
  const homeHtml = await res2.text();
  console.log("HTML length:", homeHtml.length);
  console.log("Has 'Left PV'?", homeHtml.includes("Left PV"));
  console.log("Has '74369'?", homeHtml.includes("74369"));

  // Check if admin is still working
  console.log("\nStep 3: Check if Admin cookie is still valid...");
  const adminCheck = await fetch("https://aviralifecare.com/admin/memberregister", {
    headers: { "Cookie": adminCookie },
    redirect: "manual"
  });
  console.log("Admin check status:", adminCheck.status, adminCheck.status === 200 ? "ADMIN IS STILL ALIVE! 🎉" : "DEAD ❌");
}

testDirectLogin();
