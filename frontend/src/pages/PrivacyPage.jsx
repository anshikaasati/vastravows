const PrivacyPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-24 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-bg.png')] opacity-5"></div>
                <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
                    <h1 className="text-6xl md:text-8xl font-script text-primary/90 mb-4">Privacy Policy</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide uppercase max-w-2xl mx-auto">
                        Your privacy is important to us. Last updated: December 2024
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-12">
                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
                            Information We Collect
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light pl-11">
                            <p><strong className="text-gray-900 font-medium">Personal Information:</strong> Name, email address, phone number, shipping address, and payment information.</p>
                            <p><strong className="text-gray-900 font-medium">Profile Information:</strong> Profile photos, preferences, and rental history.</p>
                            <p><strong className="text-gray-900 font-medium">Usage Data:</strong> Information about how you use our platform, including browsing patterns and interactions.</p>
                            <p><strong className="text-gray-900 font-medium">Device Information:</strong> IP address, browser type, operating system, and device identifiers.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
                            How We Use Your Information
                        </h2>
                        <div className="space-y-2 text-gray-600 font-light pl-11">
                            <ul className="list-disc list-outside ml-4 space-y-2 marker:text-primary">
                                <li>To provide and maintain our rental services</li>
                                <li>To process your transactions and send notifications</li>
                                <li>To improve and personalize your experience</li>
                                <li>To communicate with you about updates, offers, and support</li>
                                <li>To detect and prevent fraud and abuse</li>
                                <li>To comply with legal obligations</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
                            Information Sharing
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light pl-11">
                            <p>We do not sell your personal information. We may share your information with:</p>
                            <ul className="list-disc list-outside ml-4 space-y-2 marker:text-primary">
                                <li><strong className="text-gray-900 font-medium">Other Users:</strong> Necessary information to facilitate rentals (e.g., delivery address)</li>
                                <li><strong className="text-gray-900 font-medium">Service Providers:</strong> Payment processors, delivery services, and analytics providers</li>
                                <li><strong className="text-gray-900 font-medium">Legal Requirements:</strong> When required by law or to protect our rights</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">4</span>
                            Data Security
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            We implement industry-standard security measures to protect your personal information. This includes encryption,
                            secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure,
                            and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">5</span>
                            Cookies and Tracking
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light pl-11">
                            <p>We use cookies and similar tracking technologies to:</p>
                            <ul className="list-disc list-outside ml-4 space-y-2 marker:text-primary">
                                <li>Remember your preferences and settings</li>
                                <li>Understand how you use our platform</li>
                                <li>Improve our services and user experience</li>
                                <li>Deliver relevant advertisements</li>
                            </ul>
                            <p>You can control cookies through your browser settings, but this may affect platform functionality.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">6</span>
                            Your Rights
                        </h2>
                        <div className="space-y-2 text-gray-600 font-light pl-11">
                            <p>You have the right to:</p>
                            <ul className="list-disc list-outside ml-4 space-y-2 marker:text-primary">
                                <li>Access and review your personal information</li>
                                <li>Request corrections to inaccurate data</li>
                                <li>Request deletion of your account and data</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Export your data in a portable format</li>
                            </ul>
                            <p className="mt-4">To exercise these rights, contact us at <a href="mailto:hello@vastravows.com" className="text-primary hover:underline font-medium">hello@vastravows.com</a></p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">7</span>
                            Data Retention
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
                            After account deletion, we may retain certain information for legitimate business purposes or as required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">8</span>
                            Children's Privacy
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            Our service is not intended for users under 18 years of age. We do not knowingly collect personal information
                            from children. If you believe we have collected information from a child, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">9</span>
                            Changes to Privacy Policy
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            We may update this Privacy Policy from time to time. We will notify you of any material changes via email
                            or through a notice on our platform. Your continued use after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">10</span>
                            Contact Us
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            If you have questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <div className="mt-4 space-y-2 text-gray-600 font-light pl-11">
                            <p>Email: <a href="mailto:hello@vastravows.com" className="text-primary hover:underline font-medium">hello@vastravows.com</a></p>
                            <p>Phone: +91-9981100245</p>
                            <p>Address: Hatwara Asati Mohalla, Chhatarpur (M.P.)</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
