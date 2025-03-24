export interface User {
  id: string;
  email: string;
  created_at: string;
  name: string;
}

export interface Profile {
  id: number;
  user_id: string;
  fcm_token?: string;
  name?: string;
  email: string;
  gender?: string;
  dob?: string;
  tag?: string[];
  range?: number;
  last_loc?: any;
  com_id?: string;
  requests?: string[];
  image_link?: string;
  created_at: string;
}

export interface Community {
  id: number;
  com_id: string;
  title: string;
  desc: string;
  logo_link?: string;
  tags: string;
  accepted: boolean;
  location?: any;
  created_at: string;
}

export interface Request {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  description: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCommunities: number;
  pendingCommunities: number;
}