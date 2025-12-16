import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Phone, Lock, User } from 'lucide-react';

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification, 3: Password
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    emailOTP: '',
    phoneOTP: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const passwordStrengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const passwordStrengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  // Countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTPs
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Validate basic info
    if (!form.name || !form.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // TODO: Uncomment when Twilio is configured
    // if (!form.name || !form.email || !form.phone) {
    //   toast.error('Please fill in all required fields');
    //   return;
    // }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // TODO: Uncomment when Twilio is configured
    // // Validate phone format
    // const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    // if (!phoneRegex.test(form.phone)) {
    //   toast.error('Please enter a valid phone number');
    //   return;
    // }

    setLoading(true);
    try {
      await authApi.sendRegistrationOTP({
        email: form.email
        // TODO: Uncomment when Twilio is configured
        // phone: form.phone
      });
      setOtpSent(true);
      setStep(2);
      startCountdown();
      toast.success('OTP sent! Check your email.');
      // TODO: Uncomment when Twilio is configured
      // toast.success('OTPs sent! Check your email and phone.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTPs
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!form.emailOTP) {
      toast.error('Please enter the OTP');
      return;
    }

    // TODO: Uncomment when Twilio is configured
    // if (!form.emailOTP || !form.phoneOTP) {
    //   toast.error('Please enter both OTPs');
    //   return;
    // }

    if (form.emailOTP.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    // TODO: Uncomment when Twilio is configured
    // if (form.emailOTP.length !== 6 || form.phoneOTP.length !== 6) {
    //   toast.error('OTPs must be 6 digits');
    //   return;
    // }

    setLoading(true);
    try {
      await authApi.verifyRegistrationOTP({
        email: form.email,
        emailOTP: form.emailOTP
        // TODO: Uncomment when Twilio is configured
        // phone: form.phone,
        // phoneOTP: form.phoneOTP
      });
      setOtpVerified(true);
      setStep(3);
      toast.success('OTP verified! Now set your password.');
      // TODO: Uncomment when Twilio is configured
      // toast.success('OTPs verified! Now set your password.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!form.password) {
      toast.error('Please enter a password');
      return;
    }

    // Validate password strength
    if (passwordStrength < 5) {
      toast.error('Password does not meet strength requirements');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.register({
        name: form.name,
        email: form.email,
        phone: form.phone || '', // Optional for now
        password: form.password,
        emailOTP: form.emailOTP
        // TODO: Uncomment when Twilio is configured
        // phoneOTP: form.phoneOTP
      });
      login(data);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before resending`);
      return;
    }

    setLoading(true);
    try {
      await authApi.sendRegistrationOTP({
        email: form.email
        // TODO: Uncomment when Twilio is configured
        // phone: form.phone
      });
      startCountdown();
      toast.success('OTP resent!');
      // TODO: Uncomment when Twilio is configured
      // toast.success('OTPs resent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  step >= s ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold mb-2 text-center text-primary">
          {step === 1 && 'Join the Community'}
          {step === 2 && 'Verify Your Account'}
          {step === 3 && 'Set Your Password'}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          {step === 1 && 'Start your journey with Vastra Vows'}
          {step === 2 && 'Enter the OTP sent to your email'}
          {/* TODO: Uncomment when Twilio is configured */}
          {/* {step === 2 && 'Enter the OTPs sent to your email and phone'} */}
          {step === 3 && 'Create a strong password to secure your account'}
        </p>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
            {/* TODO: Uncomment when Twilio is configured */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="+91 98765 43210"
              />
            </div> */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white btn-primary shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
              {/* TODO: Uncomment when Twilio is configured */}
              {/* {loading ? 'Sending OTPs...' : 'Send Verification Codes'} */}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                OTP has been sent to <strong>{form.email}</strong>
                {/* TODO: Uncomment when Twilio is configured */}
                {/* OTPs have been sent to <strong>{form.email}</strong> and <strong>{form.phone}</strong> */}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={form.emailOTP}
                onChange={(e) => setForm((prev) => ({ ...prev, emailOTP: e.target.value.replace(/\D/g, '') }))}
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
              />
            </div>

            {/* TODO: Uncomment when Twilio is configured */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={form.phoneOTP}
                onChange={(e) => setForm((prev) => ({ ...prev, phoneOTP: e.target.value.replace(/\D/g, '') }))}
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
              />
            </div> */}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-white btn-primary shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
                {/* TODO: Uncomment when Twilio is configured */}
                {/* {loading ? 'Verifying...' : 'Verify OTPs'} */}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
                className="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTPs'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 pr-12 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? passwordStrengthColors[passwordStrength - 1]
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Strength: <span className="font-semibold">{passwordStrengthLabels[passwordStrength - 1] || 'Very Weak'}</span>
                  </p>
                  <ul className="text-xs text-gray-500 mt-2 space-y-1">
                    <li className={form.password.length >= 8 ? 'text-green-600' : ''}>
                      {form.password.length >= 8 ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(form.password) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(form.password) ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(form.password) ? 'text-green-600' : ''}>
                      {/[a-z]/.test(form.password) ? '✓' : '○'} One lowercase letter
                    </li>
                    <li className={/[0-9]/.test(form.password) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(form.password) ? '✓' : '○'} One number
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? 'text-green-600' : ''}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? '✓' : '○'} One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || passwordStrength < 5}
                className="flex-1 py-3 rounded-xl font-semibold text-white btn-primary shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
