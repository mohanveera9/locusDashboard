export interface User {
  id: string;
  email: string;
  created_at: string;
  name: string;
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
  totalRequests: number;
  rejectedRequests: number;
}