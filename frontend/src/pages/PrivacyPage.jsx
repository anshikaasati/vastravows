const PrivacyPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-primary">Privacy Policy</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your privacy is important to us. Last updated: December 2024
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl space-y-8">
                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">1. Information We Collect</h2>
                        <div className="space-y-4 text-gray-600">
                            <p><strong className="text-primary">Personal Information:</strong> Name, email address, phone number, shipping address, and payment information.</p>
                            <p><strong className="text-primary">Profile Information:</strong> Profile photos, preferences, and rental history.</p>
                            <p><strong className="text-primary">Usage Data:</strong> Information about how you use our platform, including browsing patterns and interactions.</p>
                            <p><strong className="text-primary">Device Information:</strong> IP address, browser type, operating system, and device identifiers.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">2. How We Use Your Information</h2>
                        <div className="space-y-2 text-gray-600">
                            <ul className="list-disc list-inside space-y-2">
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
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">3. Information Sharing</h2>
                        <div className="space-y-4 text-gray-600">
                            <p>We do not sell your personal information. We may share your information with:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong className="text-primary">Other Users:</strong> Necessary information to facilitate rentals (e.g., delivery address)</li>
                                <li><strong className="text-primary">Service Providers:</strong> Payment processors, delivery services, and analytics providers</li>
                                <li><strong className="text-primary">Legal Requirements:</strong> When required by law or to protect our rights</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">4. Data Security</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We implement industry-standard security measures to protect your personal information. This includes encryption,
                            secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure,
                            and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">5. Cookies and Tracking</h2>
                        <div className="space-y-4 text-gray-600">
                            <p>We use cookies and similar tracking technologies to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Remember your preferences and settings</li>
                                <li>Understand how you use our platform</li>
                                <li>Improve our services and user experience</li>
                                <li>Deliver relevant advertisements</li>
                            </ul>
                            <p>You can control cookies through your browser settings, but this may affect platform functionality.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">6. Your Rights</h2>
                        <div className="space-y-2 text-gray-600">
                            <p>You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Access and review your personal information</li>
                                <li>Request corrections to inaccurate data</li>
                                <li>Request deletion of your account and data</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Export your data in a portable format</li>
                            </ul>
                            <p className="mt-4">To exercise these rights, contact us at hello@vastravows.com</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">7. Data Retention</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
                            After account deletion, we may retain certain information for legitimate business purposes or as required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">8. Children's Privacy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Our service is not intended for users under 18 years of age. We do not knowingly collect personal information
                            from children. If you believe we have collected information from a child, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">9. Changes to Privacy Policy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any material changes via email
                            or through a notice on our platform. Your continued use after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">10. Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you have questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <div className="mt-4 space-y-2 text-gray-600">
                            <p>Email: hello@vastravows.com</p>
                            <p>Phone: +91-9981100245</p>
                            <p>Address: Hatwara Asati Mohalla, Chhatarpur(m.p.)</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
