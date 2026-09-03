import urllib.request, urllib.parse, ssl, http.cookiejar, re, json, time
from concurrent.futures import ThreadPoolExecutor

# 1. Setup HTTPS Session
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj), urllib.request.HTTPSHandler(context=ctx))

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Referer': 'https://aviralifecare.com/admin/login'
}

print('=== STARTING COMPLETE PROFILE & KYC SYNC FROM OLD WEBSITE ===')

# 2. Login to old admin panel
print('Authenticating with https://aviralifecare.com/admin/login...')
req = urllib.request.Request('https://aviralifecare.com/admin/login', headers=headers)
html = opener.open(req, timeout=15).read().decode('utf-8', errors='ignore')
csrf_token = re.search(r'name="_token"\s+value="([^"]+)"', html).group(1)

login_data = urllib.parse.urlencode({
    '_token': csrf_token,
    'email': 'admin@gmail.com',
    'password': '842026273'
}).encode('utf-8')

login_req = urllib.request.Request('https://aviralifecare.com/admin/storeLogin', data=login_data, headers=headers)
login_res = opener.open(login_req, timeout=15)
print(f'Logged in successfully. URL: {login_res.geturl()}')

# 3. Fetch Master Members Table
print('Fetching complete member register page...')
members_req = urllib.request.Request('https://aviralifecare.com/admin/memberregister', headers=headers)
members_html = opener.open(members_req, timeout=20).read().decode('utf-8', errors='ignore')

# Parse table rows
# Table columns: Edit | Sr.No | Joining Date | Member ID | Name | Email | Mobile Number | Sponsor ID | Sponsor Name | Status | Package | E-Wallet | Fund Wallet | Password | Transaction Pin
rows_pattern = re.compile(
    r'<tr class="text-center">.*?'
    r'href="(https://aviralifecare\.com/admin/memberedit/[^"]+)".*?'
    r'<td>\s*([0-9]+)\s*</td>.*?' # Sr.No
    r'<td>\s*([0-9\-:\s]+?)\s*</td>.*?' # Joining Date
    r'<a[^>]*class="text-primary fw-bold">\s*([A-Za-z0-9]+)\s*</a>.*?' # Member ID
    r'<td>\s*([^<]+?)\s*</td>.*?' # Name
    r'<td>\s*([^<]+?)\s*</td>.*?' # Email
    r'<td>\s*([0-9]+?)\s*</td>.*?' # Mobile
    r'<td>\s*([^<]+?)\s*</td>.*?' # Sponsor ID
    r'<td>\s*([^<]+?)\s*</td>.*?' # Sponsor Name
    r'<td>.*?<span[^>]*>([^<]+)</span>.*?</td>.*?' # Status
    r'<td>\s*([^<]+?)\s*</td>.*?' # Total Topup
    r'<td>\s*([0-9.]+?)\s*</td>.*?' # E-Wallet
    r'<td>\s*([0-9.]+?)\s*</td>.*?' # Fund Wallet
    r'<td>\s*([^<]+?)\s*</td>.*?' # Password
    r'<td>\s*([^<]+?)\s*</td>', # Tx Pin
    re.DOTALL | re.IGNORECASE
)

parsed_members = []
for m in rows_pattern.finditer(members_html):
    edit_url = m.group(1).strip()
    sr_no = int(m.group(2).strip())
    join_date = m.group(3).strip()
    member_id = m.group(4).strip().upper()
    full_name = m.group(5).strip()
    email = m.group(6).strip()
    mobile = m.group(7).strip()
    sponsor_id = m.group(8).strip()
    sponsor_name = m.group(9).strip()
    status = m.group(10).strip()
    e_wallet = float(m.group(12).strip() or '0')
    fund_wallet = float(m.group(13).strip() or '0')
    plain_password = m.group(14).strip()
    tx_pin = m.group(15).strip()

    parsed_members.append({
        'editUrl': edit_url,
        'srNo': sr_no,
        'joinDate': join_date,
        'memberId': member_id,
        'fullName': full_name,
        'email': email if '@' in email else f'{member_id.lower()}@aviralifecare.com',
        'mobile': mobile,
        'sponsorId': sponsor_id if sponsor_id != '-' else None,
        'sponsorName': sponsor_name if sponsor_name != '-' else None,
        'status': 'ACTIVE' if status.lower() == 'active' else 'INACTIVE',
        'eWallet': e_wallet,
        'fundWallet': fund_wallet,
        'plainPassword': plain_password,
        'txPin': tx_pin
    })

print(f'Successfully extracted basic table info for {len(parsed_members)} members.')

# 4. Concurrently fetch Edit pages for full KYC & Address info
print('Fetching full KYC, PAN, Aadhaar, Bank & Address details for all members (concurrent)...')

def fetch_single_edit_page(member):
    url = member['editUrl']
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=headers)
            h = opener.open(req, timeout=12).read().decode('utf-8', errors='ignore')
            
            def get_input(name):
                m = re.search(rf'<input[^>]+name="{name}"[^>]*value="([^"]*)"', h, re.I)
                return m.group(1).strip() if m else ''
            
            def get_select(name):
                m = re.search(rf'<select[^>]+name="{name}"[^>]*>.*?<option[^>]+selected[^>]*>([^<]+)</option>', h, re.DOTALL | re.I)
                val = m.group(1).strip() if m else ''
                return '' if 'select' in val.lower() else val

            def get_textarea(name):
                m = re.search(rf'<textarea[^>]+name="{name}"[^>]*>([^<]*)</textarea>', h, re.DOTALL | re.I)
                return m.group(1).strip() if m else ''

            pan = get_input('pan_number')
            aadhaar = get_input('adhar_number')
            adhar_name = get_input('adhar_name')
            bank = get_input('bank_name')
            account = get_input('account_number')
            ifsc = get_input('ifsc_code')
            upi = get_input('upi_id')
            nominee = get_input('nominee')
            state = get_select('state')
            city = get_input('city')
            pincode = get_input('pincode') or get_input('pin_code') or get_input('postcode')
            address = get_textarea('address2') or get_input('address')

            # Clean placeholder/dummy text
            if state and 'select' in state.lower(): state = ''
            if pincode and not re.match(r'^\d{6}$', pincode): pincode = ''

            member.update({
                'pan': pan or None,
                'aadhaar': aadhaar or None,
                'aadhaarName': adhar_name or None,
                'bankName': bank or None,
                'accountNumber': account or None,
                'ifsc': ifsc or None,
                'upiId': upi or None,
                'nominee': nominee or None,
                'state': state or None,
                'city': city or None,
                'pincode': pincode or None,
                'address': address or None
            })
            return member
        except Exception as e:
            time.sleep(0.5)
    return member

start_time = time.time()
with ThreadPoolExecutor(max_workers=16) as executor:
    full_members = list(executor.map(fetch_single_edit_page, parsed_members))

elapsed = time.time() - start_time
print(f'Finished fetching all {len(full_members)} member profiles in {elapsed:.1f} seconds.')

# Save raw scraped JSON for user cross-check and Node.js importer
with open('scripts/scraped_old_site_data.json', 'w', encoding='utf-8') as f:
    json.dump(full_members, f, indent=2)
print('Successfully saved complete scraped data for 1681 members to scripts/scraped_old_site_data.json.')
