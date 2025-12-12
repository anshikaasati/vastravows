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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Profile Header */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary via-secondary to-primary relative z-10">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {form.profilePhotoPreview ? (
                <img src={form.profilePhotoPreview} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-script text-primary font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <h1 className="text-5xl font-script text-gray-900 mb-2">{user?.name}</h1>
            <p className="text-gray-500 font-medium tracking-wide">{user?.email}</p>
          </div>

          {/* Lender Mode Toggle */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative z-10 w-full md:w-auto min-w-[300px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className={`font-display text-lg font-medium flex items-center gap-2 ${user?.isLenderEnabled ? 'text-primary' : 'text-gray-900'}`}>
                  <Shield className={`w-5 h-5 ${user?.isLenderEnabled ? 'text-primary' : 'text-gray-400'}`} />
                  Lender Mode
                  {user?.isVerified && (
                    <CheckCircle className="w-4 h-4 text-green-500" title="Verified Lender" />
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                  {user?.isLenderEnabled ? 'Listing enabled' : 'Start earning'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={user?.isLenderEnabled || false}
                  onChange={(e) => handleToggleLender(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleUpdate} className="bg-white rounded-[2.5rem] p-10 shadow-lg border border-gray-100 space-y-10">
          <div>
            <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h2>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input value={form.email} disabled className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Profile Photo</label>
                <label className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 cursor-pointer transition flex items-center justify-center gap-3 text-gray-600">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">{form.profilePhoto ? form.profilePhoto.name : 'Change Photo'}</span>
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
              <div className="pt-2">
                <h3 className="text-2xl font-display font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Payment Settings</h3>
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8 flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1">Secure Payouts</h4>
                    <p className="text-sm text-blue-800/80 leading-relaxed">
                      Enter your bank details to receive earnings directly. We process payouts weekly for completed rentals.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">UPI ID (VPA)</label>
                    <input
                      value={form.upiId || ''}
                      onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                      placeholder="username@bank"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Holder Name</label>
                    <input
                      value={form.bankAccountHolderName || ''}
                      onChange={(e) => setForm({ ...form, bankAccountHolderName: e.target.value })}
                      placeholder="As per bank records"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bank Account Number</label>
                    <input
                      value={form.bankAccountNumber || ''}
                      onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                      placeholder="1234567890"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IFSC Code</label>
                    <input
                      value={form.bankIfscCode || ''}
                      onChange={(e) => setForm({ ...form, bankIfscCode: e.target.value })}
                      placeholder="SBIN0001234"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="pt-2">
                <h3 className="text-2xl font-display font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Address Details</h3>
                <div className="grid gap-6 md:gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Street Address</label>
                    <input
                      value={form.address.street}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                      placeholder="House/Flat No., Street Name"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                    <input
                      value={form.address.city}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                      placeholder="Mumbai"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                    <input
                      value={form.address.state}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                      placeholder="Maharashtra"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pincode</label>
                    <input
                      value={form.address.pincode}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
                      placeholder="400001"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
                    <input
                      value={form.address.country}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                      placeholder="India"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>

                </div>
              </div>

              {/* ID Proof */}
              <div className="pt-2">
                <h3 className="text-2xl font-display font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">Verification Documents</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID Type</label>
                    <div className="relative">
                      <select
                        value={form.idProofType}
                        onChange={(e) => setForm({ ...form, idProofType: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none"
                      >
                        <option value="">Select ID Type</option>
                        <option value="aadhar">Aadhar Card</option>
                        <option value="pan">PAN Card</option>
                        <option value="passport">Passport</option>
                        <option value="driving_license">Driving License</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID Number</label>
                    <input
                      value={form.idProofNumber}
                      onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })}
                      placeholder="Enter ID number"
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload ID Document</label>
                    <label className="w-full px-5 py-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center gap-2 group">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Upload className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{form.idProofDocument ? form.idProofDocument.name : 'Click to Upload Document'}</span>
                      <span className="text-xs text-gray-400">PDF, JPG, PNG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'idProofDocument')}
                        className="hidden"
                      />
                    </label>
                    {form.idProofDocumentPreview && (
                      <div className="mt-4 p-2 bg-white border border-gray-100 rounded-xl inline-block shadow-sm">
                        <img src={form.idProofDocumentPreview} alt="ID Proof" className="w-32 h-32 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            {user?.isLenderEnabled && (
              <Link to="/add-item" className="px-8 py-4 border border-gray-200 text-gray-600 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-gray-50 hover:border-gray-300 transition text-center">
                List New Attire
              </Link>
            )}
          </div>
        </form>

        {/* Danger Zone */}
        <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-200/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Delete Account
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
                Once you delete your account, there is no going back. Please be certain. All your data including listings and bookings will be permanently removed.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-white border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap"
            >
              Delete My Account
            </button>
          </div>
        </div>

        {/* My Attires Section */}
        {user?.isLenderEnabled && (
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-display font-medium text-gray-900">My Attires</h2>
                <p className="text-gray-500 font-light mt-1">Manage your rental listings</p>
              </div>
              <span className="inline-flex items-center justify-center px-4 py-2 bg-primary/5 text-primary rounded-xl text-xs font-bold uppercase tracking-wider">
                {items.length} Active Listings
              </span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-500 mb-6 font-light max-w-sm mx-auto">Start your journey as a lender by listing your first premium attire.</p>
                <Link to="/add-item" className="inline-block px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-md transition">
                  List Item Now
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {items.map((item) => (
                  <div key={item._id} className="bg-white rounded-3xl p-4 flex flex-col md:flex-row gap-6 group border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="w-full md:w-56 aspect-[3/4] md:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 relative">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </div>

                    <div className="flex-1 py-2 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-display font-medium text-gray-900 group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">
                            {item.gender} • {item.subcategory?.replace(/-/g, ' ')}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/items/edit/${item._id}`}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex gap-6 mt-4">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Rent Price</p>
                            <p className="text-xl font-display font-medium text-gray-900">₹{item.rentPricePerDay}<span className="text-sm text-gray-500 font-normal">/day</span></p>
                          </div>
                          {item.salePrice && (
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Sale Price</p>
                              <p className="text-xl font-display font-medium text-gray-900">₹{item.salePrice}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-xs font-medium text-gray-600">Active Listing</span>
                        </div>
                        <Link to={`/items/${item._id}`} className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
                          View on Site
                        </Link>
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
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
