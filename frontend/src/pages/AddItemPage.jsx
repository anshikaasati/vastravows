import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Image, Info, Upload, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { itemApi, paymentApi, authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

const initialState = {
  title: '',
  description: '',
  gender: '',
  category: 'clothes',
  subcategory: '',
  size: [],
  rentPricePerDay: '',
  salePrice: '',
  depositAmount: '',
  city: '',
  pincode: '',
  addressLine: '',
  listingType: 'Rental'
};

const AddItemPage = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.subscriptionStatus !== 'active') {
      setShowSubscriptionModal(true);
    }
  }, [user]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // 1. Create Subscription
      const { data: subscription } = await paymentApi.createSubscription();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Vastra Vows",
        description: "Monthly Lender Subscription (₹100/month)",
        image: "https://i.imgur.com/3g7nmJC.png",
        handler: async function (razorpayResponse) {
          try {
            // 2. Verify Subscription
            await paymentApi.verifySubscription({
              ...razorpayResponse,
              userId: user.id || user._id
            });

            toast.success('Subscription activated! You can now list items.');

            // Update local user state
            const updatedUser = { ...user, subscriptionStatus: 'active' };
            setUser(updatedUser);
            setShowSubscriptionModal(false);

            // Optional: Refresh user from backend to be sure
            const { data: me } = await authApi.me();
            setUser(me);

          } catch (err) {
            toast.error('Subscription verification failed');
            console.error(err);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: "#D4AF37",
          backdrop_color: "rgba(212, 175, 55, 0.1)"
        },
        modal: {
          ondismiss: function () {
            toast.error('Subscription cancelled');
            setLoading(false);
          }
        }
      };

      if (!window.Razorpay) {
        toast.error('Payment SDK failed to load. Please refresh.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate subscription');
      setLoading(false);
    }
  };

  const handleContinueFree = () => {
    setShowSubscriptionModal(false);
    toast('You are on the Free Tier. ₹50 fee per rental.', {
      icon: 'ℹ️',
      duration: 4000
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Please enter an item name.');
      return;
    }
    if (!form.gender) {
      toast.error('Please select Men\'s or Women\'s collection.');
      return;
    }
    if (!form.subcategory) {
      toast.error('Please select a subcategory.');
      return;
    }
    if (!form.size || form.size.length === 0) {
      toast.error('Please select at least one size.');
      return;
    }
    if (!form.addressLine.trim()) {
      toast.error('Please enter the complete address.');
      return;
    }
    if (!files.length) {
      toast.error('Please upload at least one image');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('gender', form.gender);
    formData.append('category', form.category);
    formData.append('subcategory', form.subcategory);
    formData.append('size', Array.isArray(form.size) ? form.size.join(', ') : form.size);
    formData.append('rentPricePerDay', form.rentPricePerDay || '0');
    if (form.salePrice) formData.append('salePrice', form.salePrice);
    if (form.depositAmount) formData.append('depositAmount', form.depositAmount);
    formData.append('location[city]', form.city);
    formData.append('location[pincode]', form.pincode);
    formData.append('addressLine', form.addressLine);
    files.forEach((file) => formData.append('images', file));

    setLoading(true);
    try {
      // Create Item
      const { data: item } = await itemApi.create(formData);
      toast.success(`Item "${form.title}" listed successfully!`);

      setForm(initialState);
      setFiles([]);
      setPreviews([]);
      navigate('/profile');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to process listing');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);

    // Validate file count (max 5 images)
    if (files.length + fileArray.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-primary-berry">List Your Exquisite Attire</h2>
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-primary-berry transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Listing Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Attire/Jewelry Name
                </label>
                <input
                  type="text"
                  id="item-name"
                  placeholder="e.g., Sabyasachi Velvet Sherwani"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="item-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description & Details
                </label>
                <textarea
                  id="item-description"
                  rows="3"
                  placeholder="Describe the fabric, embroidery, size, and rental terms."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                  required
                />
              </div>

              {/* Collection (Men / Women) + Subcategory */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collection
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value, subcategory: '' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                    required
                  >
                    <option value="">Select</option>
                    <option value="women">Women&apos;s Collection</option>
                    <option value="men">Men&apos;s Collection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <select
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                    required
                    disabled={!form.gender}
                  >
                    <option value="">{form.gender ? 'Select subcategory' : 'Select collection first'}</option>
                    {form.gender === 'women' && (
                      <>
                        <option value="women-clothes-western">Clothes – Western (jeans, tops, dresses, skirts…)</option>
                        <option value="women-clothes-traditional">
                          Clothes – Traditional (lehengas, sarees, indowestern, suits…)
                        </option>
                        <option value="women-jewellery">Jewellery</option>
                        <option value="women-accessories">Accessories</option>
                        <option value="women-shoes">Shoes</option>
                        <option value="women-watches">Watches</option>
                      </>
                    )}
                    {form.gender === 'men' && (
                      <>
                        <option value="men-clothes-western">
                          Clothes – Western (jeans, shirts, t-shirts, trousers…)
                        </option>
                        <option value="men-clothes-traditional">
                          Clothes – Traditional (sherwani, indowestern, 3-piece, kurta sets…)
                        </option>
                        <option value="men-watches">Watches</option>
                        <option value="men-shoes">Shoes</option>
                        <option value="men-accessories">Accessories</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Category + Listing Type */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="item-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="item-type"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                  >
                    <option value="clothes">Clothes</option>
                    <option value="jewellery">Jewellery</option>
                    <option value="accessories">Accessories</option>
                    <option value="watch">Watch</option>
                    <option value="shoes">Shoes</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="listing-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Listing Type
                  </label>
                  <select
                    id="listing-type"
                    value={form.listingType}
                    onChange={(e) => setForm({ ...form, listingType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                  >
                    <option value="Rental">Rental (Per Day/Week)</option>
                    <option value="Sale">For Sale</option>
                  </select>
                </div>
              </div>

              {/* Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["FS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"].map((size) => (
                    <label key={size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={size}
                        checked={form.size.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, size: [...form.size, size] });
                          } else {
                            setForm({
                              ...form,
                              size: form.size.filter((s) => s !== size),
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-berry focus:ring-primary-berry"
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="item-price" className="block text-sm font-medium text-gray-700 mb-1">
                    {form.listingType === 'Sale' ? 'Sale Price (₹)' : 'Rental Fee per Day (₹)'}
                  </label>
                  <input
                    type="number"
                    id="item-price"
                    placeholder="e.g., 600"
                    value={form.listingType === 'Sale' ? form.salePrice : form.rentPricePerDay}
                    onChange={(e) =>
                      form.listingType === 'Sale'
                        ? setForm({ ...form, salePrice: e.target.value })
                        : setForm({ ...form, rentPricePerDay: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                    required
                  />
                </div>
                {form.listingType === 'Rental' && (
                  <div>
                    <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Amount (₹)
                    </label>
                    <input
                      type="number"
                      id="deposit"
                      placeholder="e.g., 5000"
                      value={form.depositAmount}
                      onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                    required
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complete Address
                </label>
                <textarea
                  rows={3}
                  placeholder="House / Flat, Street, Area, Landmark"
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-berry focus:border-primary-berry transition"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos <span className="text-gray-500">(Up to 5 images, max 5MB each)</span>
                </label>

                {/* Drag and Drop Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                    ? 'border-primary-berry bg-primary-berry/5'
                    : 'border-secondary-gold bg-secondary-gold/10 hover:bg-secondary-gold/20'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="item-image-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileChange(e.target.files);
                      }
                    }}
                  />

                  <div className="flex flex-col items-center justify-center">
                    <Upload className={`w-12 h-12 mb-3 ${dragActive ? 'text-primary-berry' : 'text-secondary-gold'}`} />
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {dragActive ? 'Drop images here' : 'Drag & drop images here'}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">or</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-secondary-gold text-white font-semibold rounded-lg hover:bg-secondary-dark transition"
                    >
                      <Image className="w-4 h-4 inline mr-2" />
                      Browse Files
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported: JPG, PNG, WEBP (Max 5MB per image)
                    </p>
                  </div>
                </div>

                {/* Image Previews */}
                {previews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Images ({previews.length}/5)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {previews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {files[idx]?.name?.substring(0, 15)}...
                          </div>
                        </div>
                      ))}
                    </div>
                    {files.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 text-sm text-primary-berry hover:text-primary-dark font-semibold"
                      >
                        + Add more images
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4 p-4 bg-yellow-50 rounded-lg text-sm text-secondary-gold border border-secondary-gold">
                <p className="font-semibold flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Important Note
                </p>
                <p>For security, all listings require verification. Please use high-quality photos.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white font-bold rounded-xl btn-gradient-vows shadow-lg text-lg disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full animate-fade-in shadow-2xl text-center">
            <div className="w-16 h-16 bg-primary-berry/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-primary-berry" />
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Choose Your Lender Plan</h3>
            <p className="text-gray-600 mb-6">
              Select a plan that suits your needs. You can upgrade anytime.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Free Tier */}
              <div className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition cursor-pointer" onClick={handleContinueFree}>
                <h4 className="font-bold text-gray-900 mb-1">Free Tier</h4>
                <p className="text-xs text-gray-500 mb-3">Pay as you earn</p>
                <ul className="text-xs text-gray-600 space-y-2 text-left">
                  <li className="flex items-center"><span className="text-red-500 mr-1">●</span> Max 10 Listings</li>
                  <li className="flex items-center"><span className="text-red-500 mr-1">●</span> ₹50 Fee per Rental</li>
                  <li className="flex items-center"><span className="text-gray-400 mr-1">●</span> Standard Support</li>
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="border-2 border-primary-berry bg-primary-berry/5 rounded-xl p-4 relative cursor-pointer" onClick={handleSubscribe}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-berry text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  RECOMMENDED
                </div>
                <h4 className="font-bold text-primary-berry mb-1">Premium</h4>
                <p className="text-xs text-gray-500 mb-3">₹100 / month</p>
                <ul className="text-xs text-gray-700 space-y-2 text-left">
                  <li className="flex items-center"><span className="text-green-500 mr-1">✔</span> Unlimited Listings</li>
                  <li className="flex items-center"><span className="text-green-500 mr-1">✔</span> 0% Platform Fee</li>
                  <li className="flex items-center"><span className="text-green-500 mr-1">✔</span> Priority Support</li>
                  <li className="flex items-center"><span className="text-green-500 mr-1">✔</span> Instant Payouts</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-berry to-primary-plum text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {loading ? 'Processing...' : 'Subscribe to Premium (₹100/mo)'}
              </button>
              <button
                onClick={handleContinueFree}
                className="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 transition"
              >
                Continue with Free Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItemPage;
