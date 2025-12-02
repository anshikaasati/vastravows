import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, itemApi } from '../api/services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, setUser, token } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', avatarUrl: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data: me } = await authApi.me();
      const ownerId = me.id || me._id;
      const { data: ownerItems } = await itemApi.getAll({ ownerId });
      setForm({
        name: me.name || '',
        email: me.email || '',
        phone: me.phone || '',
        avatarUrl: me.avatarUrl || ''
      });
      setItems(ownerItems);
      setUser(me);
    } catch (error) {
      toast.error('Unable to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.update({ name: form.name, phone: form.phone, avatarUrl: form.avatarUrl });
      setUser(data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this attire?')) return;
    try {
      await itemApi.remove(id);
      toast.success('Attire deleted');
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      toast.error('Unable to delete attire');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
        <form onSubmit={handleUpdate} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={form.email} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-berry text-white rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/add-item" className="px-6 py-2 border border-primary-berry text-primary-berry rounded-md">
              List New Attire
            </Link>
          </div>
        </form>
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">My Attires</h2>
          <p className="text-sm text-gray-500">{items.length} total</p>
        </div>
        {items.length === 0 ? (
          <p className="text-gray-500">You haven&apos;t listed any attire yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="border rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <img
                  src={item.images?.[0] || 'https://via.placeholder.com/120x120?text=No+Image'}
                  alt={item.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {item.gender} • {item.subcategory?.replace(/-/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Rent: ₹{item.rentPricePerDay}/day {item.salePrice ? `• Buy: ₹${item.salePrice}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/items/${item._id}`} className="text-primary-berry text-sm font-semibold">
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;


