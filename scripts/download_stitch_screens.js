const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, '..', 'stitch_designs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Follow redirect
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

const items = [
  {
    name: '02_shader.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTA2MGI1MTljZDIwMmE5OWY0MTMzMmNjMmU1EgsSBxC_x9_u5xkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjg4NTUzNjYyNzIxODY3NTk5Mg&filename=&opi=89354086'
  },
  {
    name: '03_threejs.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTA2MGI1ZjU0YjAwMjhmMGNlNTM2MDQ2YTQxEgsSBxC_x9_u5xkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjg4NTUzNjYyNzIxODY3NTk5Mg&filename=&opi=89354086'
  },
  {
    name: '04_home_page.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTA2MGYzZWYyM2YwMjJkNTA2ZmNjMzRhOGYwEgsSBxC_x9_u5xkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjg4NTUzNjYyNzIxODY3NTk5Mg&filename=&opi=89354086'
  },
  {
    name: '04_home_page.png',
    url: 'https://lh3.googleusercontent.com/aida/AEtjO1UYifxhnCZ254eCqNNAham56bQq3xHWMxR840azBUy1aC13_GnbsOVXvw8moosAtaXnPs2-23b9KP5C-E9TJdFA04EwcqiW3RH35oB3b2IezeLREX9Qw2Immj2RY9PYAdmDpfAOVwzmgMC0IAzOh3bGXkIZDkIgGCqa7PPByT1BdKMChIQx9LfaGKoFwHL9HGI9b7aEqu99fmhW6fYWKVzQIdiB4WbBmb4YDdr0cYrLYXG6ESr1jqcIWD-d'
  },
  {
    name: '05_network_view.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTA2MTEyMGZlYWUwMjhmMGNlNTM2MDQ2YTQxEgsSBxC_x9_u5xkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjg4NTUzNjYyNzIxODY3NTk5Mg&filename=&opi=89354086'
  },
  {
    name: '05_network_view.png',
    url: 'https://lh3.googleusercontent.com/aida/AEtjO1V4SwZeZMvw37Ra9Fblnz-hQBRyEgmwM666Ml2LVXuaxIc9T2DTlbPmBYwjythGs9hVBfJLFUXeimEfl2yquk-t5KO6rMm3i-XLvSp1Tuvr9edX97ENO_y4IO6Z_MHnKKWa6aDI5E5UI5nMvLDvzSRuL-UEv2I8NKQGwW3Np4QT66fUkoR08SMZYqQFcbkb8eFm5Hn0v2TTDQLduQmMnCYqiw46p3OK5C703PYlujqZPZ5NFe2xwMfYLXdn'
  },
  {
    name: '06_member_dashboard.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTA2MGY3ZTk5MzUwMzM4NGJmZjIyMjllNGYzEgsSBxC_x9_u5xkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjg4NTUzNjYyNzIxODY3NTk5Mg&filename=&opi=89354086'
  },
  {
    name: '06_member_dashboard.png',
    url: 'https://lh3.googleusercontent.com/aida/AEtjO1Vu8TQgYX2iV5FCmjkcM0qhVu45QZdBQ6bFllKTCHpe_BinqGIs5_aoIDJFXpJ5aolgkktPI4S6tOQYxUJ6LHeM3A-2JgAmW_PBttSHBrYIcq04pT9Ncg1ngcMA1xCG_tpwU1JC4GYJ3lyS0GaDMZKGXjyWKdhUYQEHyZ2geE4LYnWmp-wXwRUw3_T5FYzLeov1kxvYgQ81ShdFqUQnhywSgNB5QVKWKTwUF-HfQpAkz66Hc97tjNCUKSRt'
  },
  {
    name: '07_academy_training.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTA2MGY2MWYwN2UwMjJkNTA2ZmNjMzRhOGYwEgsSBxC_x9_u5xkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjg4NTUzNjYyNzIxODY3NTk5Mg&filename=&opi=89354086'
  },
  {
    name: '07_academy_training.png',
    url: 'https://lh3.googleusercontent.com/aida/AEtjO1XaB_aToEhqL6u_Kji054RDZVl1ksV6KtTEXuQ5mRBr3GRNz8qQT1GfQ4wesmHFUi_r-j7MHV1o4FrYZ7tiEC2WPDfGz5GFwYDpXx2zOaEDG_ijYQ_x3B6sHMEi8yfCGe0euo1A_vfDYNCVUlTdQy3RRnXHFkC1PxwdIdL6ROShrNdksC9gLcpLNam4VJ0RRABLzkkx2bTP99JqdrEYE2Zs5nvdVfiEG6QaRuQHD1EcMoPITTtCwYEeFxg'
  }
];

async function run() {
  console.log('Downloading Stitch project screens...');
  for (const item of items) {
    const dest = path.join(outDir, item.name);
    try {
      await downloadFile(item.url, dest);
      const stat = fs.statSync(dest);
      console.log(`✓ Downloaded ${item.name} (${(stat.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`✗ Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('All downloads completed.');
}

run();
