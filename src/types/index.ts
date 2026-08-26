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
  role: 'MEMBER' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  walletBalance: number;
  totalEarnings: number;
  directReferralsCount: number;
  totalTeamCount: number;
  todayEarnings: number;
  joinedDate: string;
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
  type: 'DIRECT_REFERRAL' | 'LEVEL_BONUS' | 'BINARY_MATCHING' | 'WITHDRAWAL' | 'WELCOME_BONUS';
  amount: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING';
  date: string;
}

export interface Order {
  id: string;
  userId: string;
  purchaseType: 'ACTIVATION' | 'REPURCHASE';
  packageName: string;
  amount: number;
  pv: number;
  createdAt: string;
}
