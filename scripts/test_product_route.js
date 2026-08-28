async function testRoutes() {
  try {
    const resPage = await fetch("http://localhost:3000/admin/products/prod_avira-choco-brain-powder");
    console.log("Page status:", resPage.status);
    const pageText = await resPage.text();
    console.log("Page text snippet:", pageText.slice(0, 300));
  } catch (err) {
    console.error("Page error:", err);
  }

  try {
    const resApi = await fetch("http://localhost:3000/api/admin/products/prod_avira-choco-brain-powder");
    console.log("API status:", resApi.status);
    const apiJson = await resApi.json();
    console.log("API JSON:", apiJson);
  } catch (err) {
    console.error("API error:", err);
  }
}

testRoutes();
