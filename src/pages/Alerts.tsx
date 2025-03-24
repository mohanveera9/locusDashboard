import React, { useEffect, useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Community } from '../types';

export const Alerts: React.FC = () => {
  const [requests, setRequests] = useState<Community[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityRequests = async () => {
      const { data: communityData, error: communityError } = await supabase
        .from('community')
        .select('*')
        .order('id', { ascending: false });
    
      if (communityError) {
        console.error('Error fetching community requests:', communityError);
        return;
      }
    
      const { data: profilesData, error: profilesError } = await supabase
        .from('profile')
        .select('user_id, name, email');
    
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }
    
      // Merge community with user profiles based on com_id
      const enrichedRequests = communityData.map((comm) => {
        const userProfile = profilesData.find((profile) => profile.com_id === comm.com_id);
        return { ...comm, user: userProfile || { name: 'Unknown', email: '' } };
      });
    
      setRequests(enrichedRequests);
      setLoading(false);
    };
    

    fetchCommunityRequests();

    const subscription = supabase
      .channel('community')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community' }, fetchCommunityRequests)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleStatusChange = async (comId: string, status: boolean) => {
    const newStatus = !status; // Toggle status
    const { error } = await supabase
      .from('community')
      .update({ accepted: newStatus })
      .eq('com_id', comId);
  
    if (error) {
      console.error('Error updating status:', error);
      return;
    }
  
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.com_id === comId ? { ...request, accepted: newStatus } : request
      )
    );
  };
  
  const filteredRequests = requests.filter((request) =>
    request.title.toLowerCase().includes(search.toLowerCase()) ||
    request.desc.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Requests ({requests.length})</h1>
        <div className="w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search communities..." />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.com_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {request.logo_link && (
                      <img className="h-8 w-8 rounded-full mr-3" src={request.logo_link} alt={request.title} />
                    )}
                    {request.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{request.desc}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.tags}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.users ? `${request.users.name} (${request.users.email})` : 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.accepted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.accepted ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {!request.accepted && (
                      <button
                        onClick={() => handleStatusChange(request.com_id, request.accepted)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Community"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    {request.accepted || (
                      <button
                        onClick={() => handleStatusChange(request.com_id, request.accepted)}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Community"
                      >
                        <XCircle size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No community requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};