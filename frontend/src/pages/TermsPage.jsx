const TermsPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-primary">Terms of Service</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Last updated: December 2024
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl space-y-8">
                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            By accessing and using Vastra Vows, you accept and agree to be bound by the terms and provision of this agreement.
                            If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">2. User Accounts</h2>
                        <div className="space-y-4 text-gray-600">
                            <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.</p>
                            <p>You are responsible for safeguarding the password and for all activities that occur under your account.</p>
                            <p>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">3. Rental Terms</h2>
                        <div className="space-y-4 text-gray-600">
                            <p><strong className="text-primary">Rental Period:</strong> Items must be returned by the agreed return date. Late returns will incur additional charges.</p>
                            <p><strong className="text-primary">Condition:</strong> Items must be returned in the same condition as received, accounting for normal wear and tear.</p>
                            <p><strong className="text-primary">Damage:</strong> Users are responsible for any damage beyond normal wear. Damage fees will be assessed based on repair costs.</p>
                            <p><strong className="text-primary">Loss:</strong> In case of lost items, users will be charged the full replacement value of the item.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">4. Payments and Refunds</h2>
                        <div className="space-y-4 text-gray-600">
                            <p>All payments must be made through our secure payment gateway. We accept major credit cards, debit cards, and digital wallets.</p>
                            <p>Security deposits are refundable upon successful return of items in acceptable condition.</p>
                            <p>Cancellations made 48+ hours before rental start receive full refund. Cancellations within 48 hours are subject to a 50% fee.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">5. Lender Responsibilities</h2>
                        <div className="space-y-4 text-gray-600">
                            <p>Lenders must accurately describe items and provide clear, honest photos.</p>
                            <p>Items must be clean and in good condition when listed.</p>
                            <p>Lenders must respond to rental requests within 24 hours.</p>
                            <p>Platform commission rates apply as per the selected subscription plan.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">6. Prohibited Activities</h2>
                        <div className="space-y-2 text-gray-600">
                            <ul className="list-disc list-inside space-y-2">
                                <li>Subletting or re-renting items obtained through our platform</li>
                                <li>Using items for commercial purposes without permission</li>
                                <li>Providing false or misleading information</li>
                                <li>Attempting to circumvent our payment system</li>
                                <li>Harassing or abusing other users or staff</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">7. Limitation of Liability</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Vastra Vows acts as a platform connecting renters and lenders. While we strive to ensure quality and safety,
                            we are not responsible for disputes between users. Our liability is limited to the amount paid for the specific transaction in question.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">8. Changes to Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We reserve the right to modify these terms at any time. We will notify users of any material changes via email
                            or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-display font-bold text-primary mb-4">9. Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you have any questions about these Terms, please contact us at hello@vastravows.com or +91-9981100245.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
