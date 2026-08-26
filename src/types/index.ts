export interface User {
  id: string;
  memberId: string; // e.g. "AV23900"
  fullName: string;
  mobile: string;
  passwordHash?: string;
  sponsorId: string; // e.g. "AV10001"
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
}

export interface RegisterInput {
  sponsorId: string;
  fullName: string;
  mobile: string;
  password: string;
  pincode: string;
  city: string;
  state: string;
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
  type: 'DIRECT_REFERRAL' | 'LEVEL_BONUS' | 'MATCHING_BONUS' | 'WITHDRAWAL' | 'WELCOME_BONUS';
  amount: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING';
  date: string;
}
