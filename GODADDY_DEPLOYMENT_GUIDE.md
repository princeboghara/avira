# 🚀 Avira LifeCare - GoDaddy હોસ્ટિંગ ટ્રાન્સફર & ડિપ્લોયમેન્ટ ગાઈડ

આ ગાઈડ તમારા આખા સોફ્ટવેરને GoDaddy હોસ્ટિંગ પર સરળતાથી લાઈવ કરવા માટે તૈયાર કરવામાં આવી છે.

---

## 📦 તૈયાર કરેલી ડિપ્લોયમેન્ટ ફાઈલ (Ready Zip File)
તમારા પ્રોજેક્ટ ફોલ્ડરમાં **`deploy-godaddy.zip`** (માત્ર ~44 MB) તૈયાર છે.
આ ફાઈલમાં:
- ✅ તાજો અને એરર-ફ્રી **`.next`** પ્રોડક્શન બિલ્ડ
- ✅ તમામ ઈમેજીસ અને પ્રોડક્ટ એસેટ્સ (**`public`**)
- ✅ **`.env`** (ડેટાબેઝ & સિક્રેટ્સ)
- ✅ **`server.js`** (GoDaddy cPanel માટે કસ્ટમ સ્ટાર્ટઅપ ફાઈલ)
- ✅ **`ecosystem.config.js`** (VPS PM2 ક્લસ્ટર મોડ)
- ✅ **`package.json`** & **`package-lock.json`**

---

## 🔹 વિકલ્પ ૧: GoDaddy cPanel Web Hosting (સૌથી સામાન્ય અને સરળ રીત)

### સ્ટેપ ૧: cPanel માં Node.js એપ્લિકેશન બનાવવી
1. GoDaddy એકાઉન્ટમાં લોગિન કરી **cPanel Admin** ખોલો.
2. **Software** સેક્શનમાં જઈને **"Setup Node.js App"** પર ક્લિક કરો.
3. **"Create Application"** બટન પર ક્લિક કરો.
4. નીચે મુજબ સેટિંગ્સ ભરો:
   - **Node.js Version**: `20.x` અથવા `22.x` (ઓછામાં ઓછું `18.x` કે તેથી વધુ)
   - **Application Mode**: `Production`
   - **Application Root**: `public_html` (અથવા જો સબડોમેઈન હોય તો તે ફોલ્ડરનું નામ, દા.ત. `avira`)
   - **Application URL**: તમારું ડોમેઈન સિલેક્ટ કરો (દા.ત. `aviracare.com`)
   - **Application Startup File**: `server.js`
5. **"CREATE"** બટન પર ક્લિક કરો.
6. એપ્લિકેશન બન્યા પછી તેને હમણાં **"STOP"** કરો.

---

### સ્ટેપ ૨: પ્રોજેક્ટ ફાઇલો અપલોડ કરવી
1. cPanel હોમપેજ પર જઈને **"File Manager"** ખોલો.
2. ઉપર જમણી બાજુ **Settings** માં જઈને **"Show Hidden Files (dotfiles)"** પર ટિક કરો અને Save કરો (જેથી `.env` અને `.next` દેખાય).
3. તમારા એપ્લિકેશન રૂટ ફોલ્ડર (`public_html`) માં જાઓ.
4. ઉપર **Upload** બટન દબાવીને તમારા કોમ્પ્યુટરમાંથી `deploy-godaddy.zip` અપલોડ કરો.
5. અપલોડ પૂર્ણ થયા પછી, `deploy-godaddy.zip` પર રાઈટ-ક્લિક કરીને **"Extract"** (Unzip) કરો.

---

### સ્ટેપ ૩: Dependencies (NPM Packages) ઇન્સ્ટોલ કરવા
1. cPanel માં પાછા **"Setup Node.js App"** સેક્શનમાં જાઓ.
2. તમારી એપ્લિકેશનના Edit (પેન્સિલ આઈકન) પર ક્લિક કરો.
3. પેજ પર નીચે **"Run NPM Install"** બટન પર ક્લિક કરો.
   *(અથવા cPanel Terminal ખોલીને `npm install --omit=dev` રન કરો)*
4. ઇન્સ્ટોલેશન પૂર્ણ થવા દો.

---

### સ્ટેપ ૪: એપ્લિકેશન સ્ટાર્ટ કરવી
1. ઉપર આપેલ **"START APPLICATION"** (અથવા **RESTART**) બટન દબાવો.
2. તમારા બ્રાઉઝરમાં ડોમેઈન (દા.ત. `https://yourdomain.com`) ખોલો.
3. તમારું Avira LifeCare સોફ્ટવેર લાઈવ થઈ જશે! 🎉

---

## 🔹 વિકલ્પ ૨: GoDaddy Linux VPS / Cloud Server (PM2 + Nginx)

જો તમારી પાસે GoDaddy VPS (Ubuntu / AlmaLinux) હોય:

### સ્ટેપ ૧: સર્વર સાથે કનેક્ટ થવું & Node.js ઇન્સ્ટોલ કરવું
```bash
ssh root@YOUR_SERVER_IP

# Node.js 20.x અને PM2 ઇન્સ્ટોલ કરો
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt update && apt install -y nodejs nginx unzip certbot python3-certbot-nginx
npm install -g pm2
```

### સ્ટેપ ૨: પ્રોજેક્ટ ફોલ્ડર બનાવવું અને ફાઇલો મૂકવી
```bash
mkdir -p /var/www/avira
cd /var/www/avira

# deploy-godaddy.zip અહીં અપલોડ કરી Unzip કરો
unzip deploy-godaddy.zip

# Production Dependencies ઇન્સ્ટોલ કરો
npm install --omit=dev
```

### સ્ટેપ ૩: PM2 વડે સર્વર ચાલુ કરવું
```bash
# PM2 ક્લસ્ટર મોડમાં ચલાવો
pm2 start ecosystem.config.js

# રીબૂટ વખતે ઓટોમેટિક ચાલુ રહે તે માટે
pm2 save
pm2 startup
```

### સ્ટેપ ૪: Nginx Reverse Proxy સેટ કરવું
`/etc/nginx/sites-available/avira` ફાઈલ બનાવો:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/avira /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# ફ્રી SSL સર્ટિફિકેટ ઇન્સ્ટોલ કરો:
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔒 ડેટાબેઝ સુરક્ષા અને કનેક્શન
- તમારો Supabase PostgreSQL ડેટાબેઝ લાઈવ ક્લાઉડ પર હોવાથી GoDaddy સર્વરથી સીધો જ ઓનલાઈન કનેક્ટ થઈ જશે.
- કોઈ લોકલ ડેટાબેઝ સેટઅપ કરવાની જરૂર નથી. બધી વિગતો `.env` ફાઈલમાં પહેલેથી જ ગોઠવેલી છે.
