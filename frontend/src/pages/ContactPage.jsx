import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactApi } from '../api/services';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await contactApi.send(formData);
            toast.success('Message sent! We\'ll get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-primary">Get In Touch</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Form */}
                    <div className="glass-card p-8 rounded-3xl">
                        <h2 className="text-3xl font-display font-bold text-primary mb-6">Send Us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full btn-primary py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Send className="w-5 h-5" />
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className="glass-card p-8 rounded-3xl">
                            <h2 className="text-3xl font-display font-bold text-primary mb-6">Contact Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">Visit Us</h3>
                                        <p className="text-gray-600">Hatwara Asati Mohalla, Chhatarpur(m.p.)</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">Call Us</h3>
                                        <p className="text-gray-600">+91-9981100245</p>
                                        <p className="text-sm text-gray-500 mt-1">Mon-Sat: 10 AM - 7 PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">Email Us</h3>
                                        <p className="text-gray-600">vastravows@gmail.com</p>
                                        <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl">
                            <h3 className="text-xl font-display font-semibold text-primary mb-4">Business Hours</h3>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Monday - Friday</span>
                                    <span className="font-semibold">10:00 AM - 7:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saturday</span>
                                    <span className="font-semibold">10:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sunday</span>
                                    <span className="font-semibold text-red-500">Closed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
