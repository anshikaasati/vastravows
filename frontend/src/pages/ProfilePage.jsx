import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, itemApi, paymentApi } from '../api/services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Shield, Upload, CheckCircle, XCircle, Edit } from 'lucide-react';



const ProfilePage = () => {
  const { user, setUser, token, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: null,
    profilePhotoPreview: '',
    // Payment info
    upiId: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankAccountHolderName: '',
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    // ID Proof
    idProofType: '',
    idProofNumber: '',
    idProofDocument: null,
    idProofDocumentPreview: ''
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
        profilePhoto: null,
        profilePhotoPreview: me.profilePhoto || '',
        upiId: me.upiId || '',
        bankAccountNumber: me.bankAccountNumber || '',
        bankIfscCode: me.bankIfscCode || '',
        bankAccountHolderName: me.bankAccountHolderName || '',
        address: {
          street: me.address?.street || '',
          city: me.address?.city || '',
          state: me.address?.state || '',
          pincode: me.address?.pincode || '',
          country: me.address?.country || 'India'
        },
        idProofType: me.idProofType || '',
        idProofNumber: me.idProofNumber || '',
        idProofDocument: null,
        idProofDocumentPreview: me.idProofDocument || ''
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

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({
          ...form,
          [fieldName]: file,
          [`${fieldName}Preview`]: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update basic profile
      const { data } = await authApi.update({
        name: form.name,
        phone: form.phone
      });

      // Update payment details if changed
      const paymentChanged =
        form.upiId !== user.upiId ||
        form.bankAccountNumber !== user.bankAccountNumber ||
        form.bankIfscCode !== user.bankIfscCode ||
        form.bankAccountHolderName !== user.bankAccountHolderName;

      if (paymentChanged) {
        await paymentApi.onboardLender({
          upiId: form.upiId,
          bankAccountNumber: form.bankAccountNumber,
          bankIfscCode: form.bankIfscCode,
          bankAccountHolderName: form.bankAccountHolderName
        });
        toast.success('Payment details updated!');
      }

      // Update verification details if changed (with file uploads)
      const verificationChanged =
        form.address.street !== user.address?.street ||
        form.address.city !== user.address?.city ||
        form.address.state !== user.address?.state ||
        form.address.pincode !== user.address?.pincode ||
        form.idProofType !== user.idProofType ||
        form.idProofNumber !== user.idProofNumber ||
        form.profilePhoto ||
        form.idProofDocument;

      if (verificationChanged) {
        const formData = new FormData();
        formData.append('address', JSON.stringify(form.address));
        if (form.idProofType) formData.append('idProofType', form.idProofType);
        if (form.idProofNumber) formData.append('idProofNumber', form.idProofNumber);
        if (form.profilePhoto) formData.append('profilePhoto', form.profilePhoto);
        if (form.idProofDocument) formData.append('idProofDocument', form.idProofDocument);

        // You'll need to create this endpoint
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/verification`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        toast.success('Verification details updated!');
      }

      setUser(data);
      toast.success('Profile updated successfully');
      loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLender = async (enable) => {
    try {
      const { data } = await authApi.toggleLenderRole(enable);
      setUser(data.user);
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to toggle lender mode');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authApi.deleteAccount();
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Profile Header */}
        <div className="glass-card rounded-3xl p-8 animate-fade-in">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-display font-bold shadow-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-primary mb-2">My Profile</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          {/* Lender Mode Toggle */}
          <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-display text-lg font-semibold flex items-center gap-2 ${user?.isLenderEnabled ? 'text-primary' : 'text-gray-900'}`}>
                  <Shield className={`w-6 h-6 ${user?.isLenderEnabled ? 'text-primary' : 'text-gray-400'}`} />
                  Lender Mode
                  {user?.isVerified && (
                    <CheckCircle className="w-5 h-5 text-green-500" title="Verified Lender" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {user?.isLenderEnabled ? 'You can list items for rent' : 'Enable to list your items'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={user?.isLenderEnabled || false}
                  onChange={(e) => handleToggleLender(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleUpdate} className="glass-card rounded-3xl p-8 space-y-8">
          <h2 className="text-2xl font-display font-bold text-primary mb-6">Personal Information</h2>

          {/* Basic Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
              <div className="flex items-center gap-3">
                {form.profilePhotoPreview && (
                  <img src={form.profilePhotoPreview} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                )}
                <label className="flex-1 px-4 py-3 rounded-xl glass-input cursor-pointer hover:bg-gray-50 transition flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{form.profilePhoto ? form.profilePhoto.name : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profilePhoto')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {user?.isLenderEnabled && (
            <>
              {/* Payment Settings */}
              <div className="border-t border-gray-200/50 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                  <p className="text-sm text-blue-800">
                    Enter your payment details. The platform owner will use this information to transfer your earnings.
                  </p>
                </div>
                <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (VPA)</label>
                    <input
                      value={form.upiId || ''}
                      onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                      placeholder="username@bank"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      value={form.bankAccountHolderName || ''}
                      onChange={(e) => setForm({ ...form, bankAccountHolderName: e.target.value })}
                      placeholder="As per bank records"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                    <input
                      value={form.bankAccountNumber || ''}
                      onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                      placeholder="1234567890"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input
                      value={form.bankIfscCode || ''}
                      onChange={(e) => setForm({ ...form, bankIfscCode: e.target.value })}
                      placeholder="SBIN0001234"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-200/50 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      value={form.address.street}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                      placeholder="House/Flat No., Street Name"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      value={form.address.city}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      value={form.address.state}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      value={form.address.pincode}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
                      placeholder="400001"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      value={form.address.country}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                      placeholder="India"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                </div>
              </div>

              {/* ID Proof */}
              <div className="border-t border-gray-200/50 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ID Proof for Verification</h3>
                <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 mb-4">
                  <p className="text-sm text-yellow-800">
                    Upload a valid government ID for verification. This helps build trust with renters.
                  </p>
                </div>
                <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                    <select
                      value={form.idProofType}
                      onChange={(e) => setForm({ ...form, idProofType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select ID Type</option>
                      <option value="aadhar">Aadhar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                    <input
                      value={form.idProofNumber}
                      onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })}
                      placeholder="Enter ID number"
                      className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID Document</label>
                    <label className="w-full px-4 py-3 rounded-xl glass-input cursor-pointer hover:bg-gray-50 transition flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{form.idProofDocument ? form.idProofDocument.name : 'Upload Document (PDF/Image)'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'idProofDocument')}
                        className="hidden"
                      />
                    </label>
                    {form.idProofDocumentPreview && (
                      <div className="mt-2">
                        <img src={form.idProofDocumentPreview} alt="ID Proof" className="w-32 h-32 object-cover rounded-lg border" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:bg-gray-800 transition disabled:opacity-50 text-center"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {user?.isLenderEnabled && (
              <Link to="/add-item" className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-white transition text-center">
                List New Attire
              </Link>
            )}
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h3>
          <div className="bg-red-50/50 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-800 mb-3">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* My Attires Section */}
        {user?.isLenderEnabled && (
          <section className="glass-card rounded-3xl p-6 md:p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">My Attires</h2>
              <span className="px-3 py-1 bg-white/50 rounded-full text-xs md:text-sm font-medium text-gray-600 border border-gray-200">
                {items.length} Listed
              </span>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-12 bg-white/30 rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">You haven&apos;t listed any attire yet.</p>
                <Link to="/add-item" className="text-primary font-semibold hover:underline">
                  Start listing now
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6">
                {items.map((item) => (
                  <div key={item._id} className="bg-white/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 md:gap-6 group border border-gray-100">
                    <div className="w-full sm:w-40 md:w-48 aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/120x120?text=No+Image'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="flex-1 py-1 md:py-2 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-medium mb-2 md:mb-4">
                            {item.gender} • {item.subcategory?.replace(/-/g, ' ')}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link
                            to={`/items/${item._id}`}
                            className="p-2 text-gray-400 hover:text-primary-berry transition"
                            title="View"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </Link>
                          <Link
                            to={`/items/edit/${item._id}`}
                            className="p-2 text-gray-400 hover:text-blue-500 transition"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
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

                      <div className="flex items-center gap-6 mt-auto pt-4">
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Account?</h3>
            <p className="text-gray-600 mb-6">
              Are you absolutely sure? This action cannot be undone. All your data including listings and bookings will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
