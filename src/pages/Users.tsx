import React, { useEffect, useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
  .from('profile')
  .select('*')
  .order('id', { ascending: false }); // Change 'id' to any other valid column


        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        console.log('Fetched users:', data); // Debug log
        setUsers(data || []);
      } catch (err) {
        console.error('Error in fetchUsers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    const subscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' }, fetchUsers)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users ({users.length})</h1>
        <div className="w-64">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search users..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.image_link && (
                      <img
                        className="h-8 w-8 rounded-full mr-3"
                        src={user.image_link}
                        alt={user.name || 'User avatar'}
                      />
                    )}
                    <div>{user.name || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.gender || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};