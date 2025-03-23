import React, { useEffect, useState } from 'react';
import { Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRequests: 0,
    rejectedRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: usersCount }, { count: requestsCount }, { count: rejectedCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('requests').select('*', { count: 'exact' }),
        supabase.from('requests').select('*', { count: 'exact' }).eq('status', 'rejected'),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalRequests: requestsCount || 0,
        rejectedRequests: rejectedCount || 0,
      });
    };

    fetchStats();
    
    // Set up real-time subscription
    const usersSubscription = supabase
      .channel('users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchStats)
      .subscribe();

    const requestsSubscription = supabase
      .channel('requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchStats)
      .subscribe();

    return () => {
      usersSubscription.unsubscribe();
      requestsSubscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h2 className="text-3xl font-bold mt-2">{stats.totalUsers}</h2>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Requests</p>
              <h2 className="text-3xl font-bold mt-2">{stats.totalRequests}</h2>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rejected Requests</p>
              <h2 className="text-3xl font-bold mt-2">{stats.rejectedRequests}</h2>
            </div>
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};