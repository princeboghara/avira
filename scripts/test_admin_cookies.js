const token1 = "eyJpdiI6IlZlalVQclNQdEQ2ZW1aNWFoNVNmcEE9PSIsInZhbHVlIjoiajF4SC9QYXUxWlp5T1FXNjBNWVluV1Z3WHdjazBKYWh2Tk9hSlZOR0hpOVA1RWl5OVZaZlU1dys3bmtjNHJBMkplM2tUSnhPK2l0T1BkVXQyaG5tVktwWTQxYzdYWGc3Y3NIbW9VUWUwdm1OZE16eWR5eTlXa3oxZlU1ZGhtTUsiLCJtYWMiOiI2MjEzZGM4ZGMwZTdiOTZiZTVkZWZmNGQxYWMzNzFjNzUzMmY0MTdlMDhmOWZkYWU1YmJkNDk5MzFjNDYyZmZhIiwidGFnIjoiIn0%3D";
const token2 = "eyJpdiI6ImpIYWtZVkM5eDBOaFNuclo1TWpUcUE9PSIsInZhbHVlIjoiZHlVZEJTU2c0U3VOSDJmYmlCZWlVMGQrc2Y1cnZMOUZHQWdOTVczdlVFSWpjZjdBeWxZQ3hkL1lRZzlpOEhRM0NGOGtpMVZ3bEc2d2VYQXBSNXBtU3pGZXFkdUNaT0ZNRk81cTlsNVZJTDQ0NGlDRmhBZDRoaWRuUXdQWXhhYUwiLCJtYWMiOiI0MzRhNmNjNTFhMmI2NTQwMGQwMDIxMzY3NTIyZjhlZWYzOGY2NjExOTI1ODA0MmQzY2I3MmEwYzg0N2JhNThlIiwidGFnIjoiIn0%3D";

// Build Cookie header trying both combinations
const cookieA = `XSRF-TOKEN=${token1}; aviralifecare_session=${token2}`;
const cookieB = `XSRF-TOKEN=${token2}; aviralifecare_session=${token1}`;

async function testCookie(cookieStr, label) {
  try {
    const res = await fetch("https://aviralifecare.com/admin/memberregister", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Cookie": cookieStr
      },
      redirect: "manual"
    });
    console.log(`[${label}] Status:`, res.status, "Location:", res.headers.get("location"));
    const html = await res.text();
    console.log(`[${label}] Length:`, html.length, "Has AV0001?", html.includes("AV0001"), "Title snippet:", html.slice(0, 300).replace(/\s+/g, ' '));
    return html.includes("AV0001") || res.status === 200;
  } catch (err) {
    console.error(label, err);
  }
}

async function run() {
  console.log("Testing combination A...");
  const okA = await testCookie(cookieA, "Combo A");
  console.log("\nTesting combination B...");
  const okB = await testCookie(cookieB, "Combo B");
}

run();
