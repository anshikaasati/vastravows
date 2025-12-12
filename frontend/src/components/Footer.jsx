import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white/50 backdrop-blur-md border-t border-gold/20 pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-xl overflow-hidden">
                                <img src="/images/vv-logo.png" alt="VV Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-display text-xl font-bold uppercase tracking-widest text-primary">Vastra Vows</span>
                        </Link>
                        <p className="text-gray-600 text-sm leading-relaxed font-light">
                            Redefining luxury fashion through sustainable rentals. Shine brighter, worry less.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-8 h-8 rounded-xl border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-xl border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-xl border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">Explore</h4>
                        <ul className="space-y-3">
                            <li><Link to="/items" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">Collection</Link></li>
                            <li><Link to="/how-it-works" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">How it Works</Link></li>
                            <li><Link to="/pricing" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">Pricing</Link></li>
                            <li><Link to="/about" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">Our Story</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">Support</h4>
                        <ul className="space-y-3">
                            <li><Link to="/faq" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">FAQs</Link></li>
                            <li><Link to="/terms" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">Privacy Policy</Link></li>
                            <li><Link to="/contact" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">Visit Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-500 font-medium">
                                <MapPin className="w-5 h-5 text-primary/60 shrink-0" />
                                <span>Hatwara Asati Mohalla, Chhatarpur(m.p.)</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                <Phone className="w-4 h-4 text-primary/60 shrink-0" />
                                <span>+91-9981100245</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                <Mail className="w-4 h-4 text-primary/60 shrink-0" />
                                <span>vastravows@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400 text-center md:text-left font-medium tracking-wide">
                        © {new Date().getFullYear()} Vastra Vows. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-gray-400 font-medium tracking-wide">Secure Payments</span>
                        <div className="flex gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                            {/* Payment icons could go here */}
                            <div className="w-8 h-5 bg-gray-200 rounded"></div>
                            <div className="w-8 h-5 bg-gray-200 rounded"></div>
                            <div className="w-8 h-5 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
