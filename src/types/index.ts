export interface User {
  id: string;
  memberId: string; // e.g. "AV00001"
  fullName: string;
  mobile: string;
  passwordHash?: string;
  sponsorId: string; // e.g. "AV00001"
  sponsorName?: string;
  pincode: string;
  city: string;
  state: string;
  address?: string;
  role: 'MEMBER' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED' | 'INACTIVE';
  walletBalance: number;
  rpWallet: number; // 2% Repurchase Wallet from Binary Income
  fundWallet?: number; // Fund Wallet balance for product purchases & deposits
  totalEarnings: number;
  directReferralsCount: number;
  totalTeamCount: number;
  todayEarnings: number;
  joinedDate: string;
  activationDate?: string;
  createdAt?: string;
  avatarUrl?: string;

  // Binary MLM Fields
  personalPv: number;
  leftPv: number;
  rightPv: number;
  carryLeftPv: number;
  carryRightPv: number;
  binaryParentId?: string | null;
  binaryPosition?: 'LEFT' | 'RIGHT' | 'ROOT' | null;
  leftChildId?: string | null;
  rightChildId?: string | null;
  dailyCapping: number; // 1000, 2000, 3000, 5000

  // KYC and Banking Fields
  email?: string;
  gstNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  aadhaarName?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  panCardUrl?: string;
  bankProofUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  kycDocumentUrl?: string;
  kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  aadhaarStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  panStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  bankStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  aadhaarRejectionReason?: string;
  panRejectionReason?: string;
  bankRejectionReason?: string;
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  kycRejectionReason?: string;
}

export interface BinaryTreeNode {
  id: string;
  memberId: string;
  fullName: string;
  status: string;
  personalPv: number;
  leftPv: number;
  rightPv: number;
  dailyCapping: number;
  position?: 'LEFT' | 'RIGHT' | 'ROOT';
  leftChild?: BinaryTreeNode | null;
  rightChild?: BinaryTreeNode | null;
}

export interface RegisterInput {
  sponsorId: string;
  fullName: string;
  mobile: string;
  password: string;
  pincode: string;
  city: string;
  state: string;
  position?: 'LEFT' | 'RIGHT';
}

export interface LoginInput {
  loginIdentifier: string; // memberId or mobile
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface SponsorInfo {
  exists: boolean;
  memberId: string;
  fullName: string;
  status?: string;
}

export interface PincodeInfo {
  success: boolean;
  pincode: string;
  city: string;
  state: string;
  district?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DIRECT_REFERRAL' | 'LEVEL_BONUS' | 'BINARY_MATCHING' | 'LEADERSHIP_BONUS' | 'ROYALTY_INCOME' | 'WITHDRAWAL' | 'WELCOME_BONUS';
  amount: number; // Gross amount
  tdsAmount?: number; // 2% TDS
  adminCharge?: number; // 8% Admin Fee
  rpWalletAmount?: number; // 5% Repurchase Wallet
  netAmount?: number; // Net paid to wallet (85%)
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING';
  date: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  memberId: string;
  fullName: string;
  mobile?: string;
  subject: string;
  category: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  adminResponse?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
  createdAt?: string;
}

export interface HsnCode {
  id: string;
  hsnCode: string;
  sgst: number;
  cgst: number;
  igst: number;
  description?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId?: string;
  category: string;
  hsnCode?: string;
  description?: string;
  netQuantity: string;
  stockQuantity?: number; // Available inventory stock units
  mrp: number; // Maximum Retail Price in INR
  discountPrice?: number; // Offer / Associate DP Price in INR
  pv: number;  // Point Value (e.g. 12 PV)
  imageUrl?: string;
  tag?: string;
  inStock: boolean;
  imageIcon?: string;
  createdAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  mrp: number;
  pv: number;
  subtotalMrp: number;
  subtotalPv: number;
}

export interface Order {
  id: string;
  userId: string;
  memberId?: string;
  date?: string;
  billedBy?: string;
  buyerName?: string;
  buyerMobile?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerState?: string;
  buyerPincode?: string;
  customerName?: string;
  customerMobile?: string;
  shippingAddress?: string;
  transactionId?: string;
  paymentSlip?: string;
  rejectionReason?: string;
  purchaseType: 'ACTIVATION' | 'REPURCHASE';
  packageName: string;
  amount: number;
  pv: number;
  items?: OrderItem[];
  status?: string;
  createdAt: string;
}

export interface FundRequest {
  id: string;
  userId: string;
  memberId: string;
  fullName: string;
  mobile: string;
  amount: number;
  transactionId: string;
  slipUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}
