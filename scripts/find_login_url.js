async function checkUrls() {
  const urls = [
    'https://aviralifecare.com/member/login',
    'https://aviralifecare.com/user/login',
    'https://aviralifecare.com/admin/login',
    'https://aviralifecare.com/member-login',
    'https://aviralifecare.com/sign-in',
    'https://aviralifecare.com/'
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, { redirect: 'manual' });
      console.log(u, '->', res.status, res.headers.get('location'));
    } catch (e) {
      console.log(u, 'Error');
    }
  }
}

checkUrls();
