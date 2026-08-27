// Indian Currency Number to Words & GST State Code Mapping

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertBelowThousand(n: number): string {
  let str = "";
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + ones[n % 10] : "");
  } else if (n > 0) {
    str += ones[n];
  }
  return str.trim();
}

export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Zero Rupees Only";

  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  let words = "";

  const crore = Math.floor(rupees / 10000000);
  let remainder = rupees % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  if (crore > 0) {
    words += convertBelowThousand(crore) + " Crore ";
  }
  if (lakh > 0) {
    words += convertBelowThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += convertBelowThousand(thousand) + " Thousand ";
  }
  if (remainder > 0) {
    words += convertBelowThousand(remainder) + " ";
  }

  words = words.trim() + " Rupees";

  if (paise > 0) {
    words += " and " + convertBelowThousand(paise) + " Paise";
  }

  return words + " Only";
}

export const STATE_GST_CODES: Record<string, string> = {
  JAMMU_AND_KASHMIR: "01",
  "JAMMU & KASHMIR": "01",
  HIMACHAL_PRADESH: "02",
  "HIMACHAL PRADESH": "02",
  PUNJAB: "03",
  CHANDIGARH: "04",
  UTTARAKHAND: "05",
  HARYANA: "06",
  DELHI: "07",
  RAJASTHAN: "08",
  UTTAR_PRADESH: "09",
  "UTTAR PRADESH": "09",
  BIHAR: "10",
  SIKKIM: "11",
  ARUNACHAL_PRADESH: "12",
  "ARUNACHAL PRADESH": "12",
  NAGALAND: "13",
  MANIPUR: "14",
  MIZORAM: "15",
  TRIPURA: "16",
  MEGHALAYA: "17",
  ASSAM: "18",
  WEST_BENGAL: "19",
  "WEST BENGAL": "19",
  JHARKHAND: "20",
  ODISHA: "21",
  ORISSA: "21",
  CHHATTISGARH: "22",
  MADHYA_PRADESH: "23",
  "MADHYA PRADESH": "23",
  GUJARAT: "24",
  DAMAN_AND_DIU: "26",
  DADRA_AND_NAGAR_HAVELI: "26",
  MAHARASHTRA: "27",
  ANDHRA_PRADESH: "37",
  "ANDHRA PRADESH": "37",
  KARNATAKA: "29",
  GOA: "30",
  LAKSHADWEEP: "31",
  KERALA: "32",
  TAMIL_NADU: "33",
  "TAMIL NADU": "33",
  PUDUCHERRY: "34",
  PONDICHERRY: "34",
  ANDAMAN_AND_NICOBAR: "35",
  "ANDAMAN & NICOBAR": "35",
  TELANGANA: "36",
  LADAKH: "38",
};

export function getStateGstCode(stateName?: string): string {
  if (!stateName) return "24";
  const clean = stateName.trim().toUpperCase();
  return STATE_GST_CODES[clean] || "24";
}
