import { PincodeInfo } from "@/types";

// Offline directory of notable pincodes & prefix regions across India for instant zero-latency resolution
const PINCODE_MAP: Record<string, { city: string; state: string; district: string }> = {
  "380001": { city: "Ahmedabad", state: "Gujarat", district: "Ahmedabad" },
  "380015": { city: "Ahmedabad", state: "Gujarat", district: "Ahmedabad" },
  "380054": { city: "Ahmedabad", state: "Gujarat", district: "Ahmedabad" },
  "395001": { city: "Surat", state: "Gujarat", district: "Surat" },
  "395007": { city: "Surat", state: "Gujarat", district: "Surat" },
  "390001": { city: "Vadodara", state: "Gujarat", district: "Vadodara" },
  "360001": { city: "Rajkot", state: "Gujarat", district: "Rajkot" },
  "361001": { city: "Jamnagar", state: "Gujarat", district: "Jamnagar" },
  "364001": { city: "Bhavnagar", state: "Gujarat", district: "Bhavnagar" },
  "382010": { city: "Gandhinagar", state: "Gujarat", district: "Gandhinagar" },
  "400001": { city: "Mumbai", state: "Maharashtra", district: "Mumbai" },
  "400050": { city: "Mumbai", state: "Maharashtra", district: "Mumbai" },
  "411001": { city: "Pune", state: "Maharashtra", district: "Pune" },
  "110001": { city: "New Delhi", state: "Delhi", district: "Central Delhi" },
  "560001": { city: "Bengaluru", state: "Karnataka", district: "Bangalore" },
  "500001": { city: "Hyderabad", state: "Telangana", district: "Hyderabad" },
  "600001": { city: "Chennai", state: "Tamil Nadu", district: "Chennai" },
  "700001": { city: "Kolkata", state: "West Bengal", district: "Kolkata" },
  "302001": { city: "Jaipur", state: "Rajasthan", district: "Jaipur" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh", district: "Lucknow" },
  "462001": { city: "Bhopal", state: "Madhya Pradesh", district: "Bhopal" },
  "800001": { city: "Patna", state: "Bihar", district: "Patna" },
  "160001": { city: "Chandigarh", state: "Punjab", district: "Chandigarh" },
};

// Fallback state mapping based on first 2 digits of Indian PIN codes
const PREFIX_STATE_MAP: Record<string, { state: string; defaultCity: string }> = {
  "11": { state: "Delhi", defaultCity: "Delhi" },
  "12": { state: "Haryana", defaultCity: "Faridabad" },
  "13": { state: "Haryana", defaultCity: "Ambala" },
  "14": { state: "Punjab", defaultCity: "Ludhiana" },
  "15": { state: "Punjab", defaultCity: "Bathinda" },
  "16": { state: "Chandigarh", defaultCity: "Chandigarh" },
  "17": { state: "Himachal Pradesh", defaultCity: "Shimla" },
  "18": { state: "Jammu & Kashmir", defaultCity: "Jammu" },
  "19": { state: "Jammu & Kashmir", defaultCity: "Srinagar" },
  "20": { state: "Uttar Pradesh", defaultCity: "Aligarh" },
  "21": { state: "Uttar Pradesh", defaultCity: "Prayagraj" },
  "22": { state: "Uttar Pradesh", defaultCity: "Lucknow" },
  "23": { state: "Uttar Pradesh", defaultCity: "Mirzapur" },
  "24": { state: "Uttarakhand", defaultCity: "Dehradun" },
  "25": { state: "Uttar Pradesh", defaultCity: "Meerut" },
  "26": { state: "Uttar Pradesh", defaultCity: "Bareilly" },
  "27": { state: "Uttar Pradesh", defaultCity: "Gorakhpur" },
  "28": { state: "Uttar Pradesh", defaultCity: "Jhansi" },
  "30": { state: "Rajasthan", defaultCity: "Jaipur" },
  "31": { state: "Rajasthan", defaultCity: "Udaipur" },
  "32": { state: "Rajasthan", defaultCity: "Kota" },
  "33": { state: "Rajasthan", defaultCity: "Bikaner" },
  "34": { state: "Rajasthan", defaultCity: "Jodhpur" },
  "36": { state: "Gujarat", defaultCity: "Rajkot" },
  "37": { state: "Gujarat", defaultCity: "Kutch" },
  "38": { state: "Gujarat", defaultCity: "Ahmedabad" },
  "39": { state: "Gujarat", defaultCity: "Surat" },
  "40": { state: "Maharashtra", defaultCity: "Mumbai" },
  "41": { state: "Maharashtra", defaultCity: "Pune" },
  "42": { state: "Maharashtra", defaultCity: "Nashik" },
  "43": { state: "Maharashtra", defaultCity: "Aurangabad" },
  "44": { state: "Maharashtra", defaultCity: "Nagpur" },
  "45": { state: "Madhya Pradesh", defaultCity: "Indore" },
  "46": { state: "Madhya Pradesh", defaultCity: "Bhopal" },
  "47": { state: "Madhya Pradesh", defaultCity: "Gwalior" },
  "48": { state: "Madhya Pradesh", defaultCity: "Jabalpur" },
  "49": { state: "Chhattisgarh", defaultCity: "Raipur" },
  "50": { state: "Telangana", defaultCity: "Hyderabad" },
  "51": { state: "Andhra Pradesh", defaultCity: "Tirupati" },
  "52": { state: "Andhra Pradesh", defaultCity: "Vijayawada" },
  "53": { state: "Andhra Pradesh", defaultCity: "Visakhapatnam" },
  "56": { state: "Karnataka", defaultCity: "Bengaluru" },
  "57": { state: "Karnataka", defaultCity: "Mangaluru" },
  "58": { state: "Karnataka", defaultCity: "Hubballi" },
  "59": { state: "Karnataka", defaultCity: "Belagavi" },
  "60": { state: "Tamil Nadu", defaultCity: "Chennai" },
  "61": { state: "Tamil Nadu", defaultCity: "Thanjavur" },
  "62": { state: "Tamil Nadu", defaultCity: "Madurai" },
  "63": { state: "Tamil Nadu", defaultCity: "Salem" },
  "64": { state: "Tamil Nadu", defaultCity: "Coimbatore" },
  "67": { state: "Kerala", defaultCity: "Kozhikode" },
  "68": { state: "Kerala", defaultCity: "Kochi" },
  "69": { state: "Kerala", defaultCity: "Thiruvananthapuram" },
  "70": { state: "West Bengal", defaultCity: "Kolkata" },
  "71": { state: "West Bengal", defaultCity: "Howrah" },
  "75": { state: "Odisha", defaultCity: "Bhubaneswar" },
  "78": { state: "Assam", defaultCity: "Guwahati" },
  "80": { state: "Bihar", defaultCity: "Patna" },
  "83": { state: "Jharkhand", defaultCity: "Ranchi" },
};

// 3-digit regional prefix mapping for instant 0ms zero-latency resolution
const PREFIX_3_MAP: Record<string, { city: string; state: string; district: string }> = {
  // Gujarat
  "380": { city: "Ahmedabad", state: "Gujarat", district: "Ahmedabad" },
  "382": { city: "Gandhinagar", state: "Gujarat", district: "Gandhinagar" },
  "383": { city: "Himmatnagar", state: "Gujarat", district: "Sabarkantha" },
  "384": { city: "Mehsana", state: "Gujarat", district: "Mehsana" },
  "385": { city: "Palanpur", state: "Gujarat", district: "Banaskantha" },
  "387": { city: "Nadiad", state: "Gujarat", district: "Kheda" },
  "388": { city: "Anand", state: "Gujarat", district: "Anand" },
  "389": { city: "Godhra", state: "Gujarat", district: "Panchmahal" },
  "390": { city: "Vadodara", state: "Gujarat", district: "Vadodara" },
  "391": { city: "Vadodara Rural", state: "Gujarat", district: "Vadodara" },
  "392": { city: "Bharuch", state: "Gujarat", district: "Bharuch" },
  "393": { city: "Ankleshwar", state: "Gujarat", district: "Bharuch" },
  "394": { city: "Surat Rural", state: "Gujarat", district: "Surat" },
  "395": { city: "Surat", state: "Gujarat", district: "Surat" },
  "396": { city: "Navsari / Valsad", state: "Gujarat", district: "Navsari" },
  "360": { city: "Rajkot", state: "Gujarat", district: "Rajkot" },
  "361": { city: "Jamnagar", state: "Gujarat", district: "Jamnagar" },
  "362": { city: "Junagadh", state: "Gujarat", district: "Junagadh" },
  "363": { city: "Surendranagar", state: "Gujarat", district: "Surendranagar" },
  "364": { city: "Bhavnagar", state: "Gujarat", district: "Bhavnagar" },
  "365": { city: "Amreli", state: "Gujarat", district: "Amreli" },
  "370": { city: "Bhuj / Kutch", state: "Gujarat", district: "Kutch" },
  // Maharashtra
  "400": { city: "Mumbai", state: "Maharashtra", district: "Mumbai" },
  "401": { city: "Thane", state: "Maharashtra", district: "Thane" },
  "411": { city: "Pune", state: "Maharashtra", district: "Pune" },
  "422": { city: "Nashik", state: "Maharashtra", district: "Nashik" },
  "440": { city: "Nagpur", state: "Maharashtra", district: "Nagpur" },
  // Rajasthan
  "302": { city: "Jaipur", state: "Rajasthan", district: "Jaipur" },
  "313": { city: "Udaipur", state: "Rajasthan", district: "Udaipur" },
  "324": { city: "Kota", state: "Rajasthan", district: "Kota" },
  "342": { city: "Jodhpur", state: "Rajasthan", district: "Jodhpur" },
  // Delhi
  "110": { city: "New Delhi", state: "Delhi", district: "New Delhi" },
};

export async function lookupPincode(pincode: string): Promise<PincodeInfo> {
  const cleaned = pincode.trim().replace(/\D/g, "");

  if (cleaned.length !== 6) {
    return {
      success: false,
      pincode: cleaned,
      city: "",
      state: "",
    };
  }

  // 1. Direct match in local dictionary (0ms instant)
  if (PINCODE_MAP[cleaned]) {
    const entry = PINCODE_MAP[cleaned];
    return {
      success: true,
      pincode: cleaned,
      city: entry.city,
      state: entry.state,
      district: entry.district,
    };
  }

  // 2. High-speed 3-digit regional prefix match (0ms instant)
  const pref3 = cleaned.substring(0, 3);
  if (PREFIX_3_MAP[pref3]) {
    const entry = PREFIX_3_MAP[pref3];
    return {
      success: true,
      pincode: cleaned,
      city: entry.city,
      state: entry.state,
      district: entry.district,
    };
  }

  // 3. Try online Indian Postal Service API with fast 800ms timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const city = postOffice.District || postOffice.Block || postOffice.Name || "";
        const state = postOffice.State || "";
        return {
          success: true,
          pincode: cleaned,
          city,
          state,
          district: postOffice.District,
        };
      }
    }
  } catch {
    // Graceful fallback to prefix table
  }

  // 3. Fallback to Postal Prefix Circle
  const prefix = cleaned.substring(0, 2);
  if (PREFIX_STATE_MAP[prefix]) {
    const mapping = PREFIX_STATE_MAP[prefix];
    return {
      success: true,
      pincode: cleaned,
      city: mapping.defaultCity,
      state: mapping.state,
    };
  }

  return {
    success: false,
    pincode: cleaned,
    city: "",
    state: "",
  };
}
