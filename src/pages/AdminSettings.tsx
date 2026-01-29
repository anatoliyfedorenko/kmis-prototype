import { useRole, useTaxonomy } from '../hooks/useStore';
import { Link } from 'react-router-dom';

const mockUsers = [
  { name: 'Sarah Johnson', role: 'Admin', email: 'sarah.johnson@example.org', status: 'Active' },
  { name: 'James Osei', role: 'Admin', email: 'james.osei@example.org', status: 'Active' },
  { name: 'Maria Silva', role: 'Viewer', email: 'maria.silva@example.org', status: 'Active' },
  { name: 'Ahmad Wijaya', role: 'Viewer', email: 'ahmad.wijaya@example.org', status: 'Active' },
  { name: 'Claire Dupont', role: 'Viewer', email: 'claire.dupont@example.org', status: 'Active' },
  { name: 'David Mensah', role: 'Viewer', email: 'david.mensah@example.org', status: 'Inactive' },
];

export default function AdminSettings() {
  const role = useRole();
  const taxonomy = useTaxonomy();

  if (role !== 'admin') {
    return <div className="text-center py-12"><p className="text-gray-500 mb-4">This page is only available to Internal Admin users.</p><Link to="/" className="text-blue-600">Go to home</Link></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Taxonomy Lists</h2>
          <div className="space-y-4">
            {Object.entries(taxonomy).map(([key, values]) => (
              <div key={key}>
                <h3 className="text-sm font-medium text-gray-700 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <div className="flex flex-wrap gap-1">
                  {(values as string[]).map(v => (
                    <span key={v} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">User Management</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-2">Name</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(u => (
                <tr key={u.email} className="border-b border-gray-100">
                  <td className="py-2">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="py-2">{u.role}</td>
                  <td className="py-2">
                    <span className={u.status === 'Active' ? 'text-green-600' : 'text-gray-400'}>{u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
