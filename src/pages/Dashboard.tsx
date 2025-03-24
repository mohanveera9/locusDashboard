import React, { useEffect, useState } from 'react';
import { Users, Building2, ClockIcon, Link } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCommunities: 0,
    pendingCommunities: 0,
  });
  
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: usersCount },
        { count: communitiesCount },
        { count: pendingCount }
      ] = await Promise.all([
        supabase.from('profile').select('*', { count: 'exact' }),
        supabase.from('community').select('*', { count: 'exact' }),
        supabase.from('community').select('*', { count: 'exact' }).eq('accepted', false),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalCommunities: communitiesCount || 0,
        pendingCommunities: pendingCount || 0,
      });
    };

    fetchStats();
    
    // Set up real-time subscription
    const profileSubscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' }, fetchStats)
      .subscribe();

    const communitySubscription = supabase
      .channel('community-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community' }, fetchStats)
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
      communitySubscription.unsubscribe();
    };
  }, []);

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setSubmitMessage({ text: 'Please enter a valid URL', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        setSubmitMessage({ text: 'Invalid URL format', type: 'error' });
        setIsSubmitting(false);
        return;
      }
      
      // Insert URL into Supabase table
      const { error } = await supabase
        .from('admin_urls') // Assuming this is your table name
        .insert([{ url, created_at: new Date().toISOString() }]);
      
      if (error) {
        throw error;
      }
      
      setSubmitMessage({ text: 'URL added successfully!', type: 'success' });
      setUrl(''); // Clear input field
    } catch (error) {
      console.error('Error submitting URL:', error);
      setSubmitMessage({ 
        text: 'Failed to add URL. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setSubmitMessage({ text: '', type: '' });
      }, 5000);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-gray-500 text-sm">Total Communities</p>
              <h2 className="text-3xl font-bold mt-2">{stats.totalCommunities}</h2>
            </div>
            <Building2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Communities</p>
              <h2 className="text-3xl font-bold mt-2">{stats.pendingCommunities}</h2>
            </div>
            <ClockIcon className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>
      
      {/* New URL Submission Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center mb-4">
          <Link className="w-6 h-6 text-indigo-500 mr-2" />
          <h2 className="text-xl font-semibold">Add New URL</h2>
        </div>
        
        <form onSubmit={handleSubmitUrl} className="space-y-4">
          <div>
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {submitMessage.text && (
            <div className={`text-sm ${submitMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {submitMessage.text}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add URL'}
          </button>
        </form>
      </div>
    </div>
  );
};