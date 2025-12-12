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
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-24 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-bg.png')] opacity-5"></div>
                <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
                    <h1 className="text-6xl md:text-8xl font-script text-primary/90 mb-4">Get In Touch</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide uppercase max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Form */}
                    <div className="glass-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl bg-white/80 backdrop-blur-xl border border-white/60">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-8">Send Us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm"
                                    placeholder="Tell us more about your inquiry..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full py-4 rounded-full bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Send className="w-4 h-4" />
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-8 pt-10 md:pt-20">
                        <div className="p-8 md:p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-8">Contact Information</h2>
                            <div className="space-y-8">
                                <div className="flex items-start gap-6 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <MapPin className="w-6 h-6 text-primary group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-gray-900 text-lg mb-1">Visit Us</h3>
                                        <p className="text-gray-500 leading-relaxed text-sm">Hatwara Asati Mohalla,<br />Chhatarpur (M.P.)</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Phone className="w-6 h-6 text-primary group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-gray-900 text-lg mb-1">Call Us</h3>
                                        <p className="text-gray-500 text-sm hover:text-primary transition-colors">+91-9981100245</p>
                                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Mon-Sat: 10 AM - 7 PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Mail className="w-6 h-6 text-primary group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-gray-900 text-lg mb-1">Email Us</h3>
                                        <p className="text-gray-500 text-sm hover:text-primary transition-colors">vastravows@gmail.com</p>
                                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Responses within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-[#fdf2f4] border border-[#fce7ec]">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">Business Hours</h3>
                            <div className="space-y-4 text-sm text-gray-600">
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span>Monday - Friday</span>
                                    <span className="font-semibold text-gray-900">10:00 AM - 7:00 PM</span>
                                </div>
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span>Saturday</span>
                                    <span className="font-semibold text-gray-900">10:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span>Sunday</span>
                                    <span className="font-bold text-primary uppercase tracking-wider text-xs bg-white px-2 py-0.5 rounded-full">Closed</span>
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
