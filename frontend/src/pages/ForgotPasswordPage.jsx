import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/services';
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.forgotPassword({ email });
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }
        setLoading(true);
        try {
            await authApi.verifyOTP({ email, otp });
            toast.success('OTP verified!');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await authApi.resetPassword({ email, otp, newPassword });
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await authApi.forgotPassword({ email });
            toast.success('New OTP sent to your email!');
            setOTP('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
            <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-primary" />

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-display font-bold text-primary mb-2">
                        {step === 1 && 'Forgot Password?'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'Set New Password'}
                    </h2>
                    <p className="text-gray-500">
                        {step === 1 && 'Enter your email to receive a verification code'}
                        {step === 2 && 'Enter the 6-digit code sent to your email'}
                        {step === 3 && 'Create a new password for your account'}
                    </p>
                </div>

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <form onSubmit={handleRequestOTP} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white btn-primary shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Input */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all text-center text-2xl tracking-widest font-mono"
                                placeholder="000000"
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                OTP expires in 10 minutes
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white btn-primary shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="w-full text-sm text-primary hover:underline disabled:opacity-50"
                        >
                            Didn't receive the code? Resend OTP
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl glass-input focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white btn-primary shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* Back to Login */}
                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
