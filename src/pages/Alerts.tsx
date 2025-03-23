import React, { useEffect, useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { supabase } from '../lib/supabase';
import type { Request } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

export const Alerts: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('requests')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      setRequests(data || []);
      setLoading(false);
    };

    fetchRequests();

    const subscription = supabase
      .channel('requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchRequests)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleStatusChange = async (requestId: string, status: 'approved' | 'rejected') => {
    await supabase
      .from('requests')
      .update({ status })
      .eq('id', requestId);
  };

  const filteredRequests = requests.filter((request) =>
    request.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <div className="w-64">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search requests..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.users.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(request.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(request.id, 'approved')}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};