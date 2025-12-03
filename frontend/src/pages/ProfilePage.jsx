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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8 md:space-y-10">
      <section className="glass-panel rounded-3xl p-4 md:p-8 animate-fade-in">
        <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-gray-900">My Profile</h2>
        <form onSubmit={handleUpdate} className="grid gap-4 md:gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={form.email} disabled className="w-full px-4 py-3 rounded-xl bg-gray-100/50 border border-gray-200 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary-berry/20"
            />
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:bg-gray-800 transition disabled:opacity-50 text-center"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/add-item" className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-white transition text-center">
              List New Attire
            </Link>
          </div>
        </form>
      </section>

      <section className="glass-panel rounded-3xl p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">My Attires</h2>
          <span className="px-3 py-1 bg-white/50 rounded-full text-xs md:text-sm font-medium text-gray-600 border border-gray-200">
            {items.length} Listed
          </span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white/30 rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">You haven&apos;t listed any attire yet.</p>
            <Link to="/add-item" className="text-primary-berry font-semibold hover:underline">
              Start listing now
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {items.map((item) => (
              <div key={item._id} className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4 md:gap-6 group">
                <div className="w-full sm:w-40 md:w-48 aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/120x120?text=No+Image'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="flex-1 py-1 md:py-2 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-medium mb-2 md:mb-4">
                        {item.gender} • {item.subcategory?.replace(/-/g, ' ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/items/${item._id}`}
                        className="p-2 text-gray-400 hover:text-primary-berry transition"
                        title="View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-auto pt-4 md:pt-0">
                    <div>
                      <span className="text-xs text-gray-500 block">Rent Price</span>
                      <span className="font-bold text-gray-900">₹{item.rentPricePerDay}<span className="text-xs font-normal text-gray-500">/day</span></span>
                    </div>
                    {item.salePrice && (
                      <div>
                        <span className="text-xs text-gray-500 block">Sale Price</span>
                        <span className="font-bold text-gray-900">₹{item.salePrice}</span>
                      </div>
                    )}
                  </div>
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


