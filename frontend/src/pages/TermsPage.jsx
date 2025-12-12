const TermsPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-24 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-bg.png')] opacity-5"></div>
                <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
                    <h1 className="text-6xl md:text-8xl font-script text-primary/90 mb-4">Terms of Service</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide uppercase max-w-2xl mx-auto">
                        Last updated: December 2024
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-12">
                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
                            Acceptance of Terms
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            By accessing and using Vastra Vows, you accept and agree to be bound by the terms and provision of this agreement.
                            If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
                            User Accounts
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light pl-11">
                            <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.</p>
                            <p>You are responsible for safeguarding the password and for all activities that occur under your account.</p>
                            <p>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
                            Rental Terms
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light pl-11">
                            <p><strong className="text-gray-900 font-medium">Rental Period:</strong> Items must be returned by the agreed return date. Late returns will incur additional charges.</p>
                            <p><strong className="text-gray-900 font-medium">Condition:</strong> Items must be returned in the same condition as received, accounting for normal wear and tear.</p>
                            <p><strong className="text-gray-900 font-medium">Damage:</strong> Users are responsible for any damage beyond normal wear. Damage fees will be assessed based on repair costs.</p>
                            <p><strong className="text-gray-900 font-medium">Loss:</strong> In case of lost items, users will be charged the full replacement value of the item.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">4</span>
                            Payments and Refunds
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light pl-11">
                            <p>All payments must be made through our secure payment gateway. We accept major credit cards, debit cards, and digital wallets.</p>
                            <p>Security deposits are refundable upon successful return of items in acceptable condition.</p>
                            <p>Cancellations made 48+ hours before rental start receive full refund. Cancellations within 48 hours are subject to a 50% fee.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">5</span>
                            Lender Responsibilities
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light pl-11">
                            <p>Lenders must accurately describe items and provide clear, honest photos.</p>
                            <p>Items must be clean and in good condition when listed.</p>
                            <p>Lenders must respond to rental requests within 24 hours.</p>
                            <p>Platform commission rates apply as per the selected subscription plan.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">6</span>
                            Prohibited Activities
                        </h2>
                        <div className="space-y-2 text-gray-600 font-light pl-11">
                            <ul className="list-disc list-outside ml-4 space-y-2 marker:text-primary">
                                <li>Subletting or re-renting items obtained through our platform</li>
                                <li>Using items for commercial purposes without permission</li>
                                <li>Providing false or misleading information</li>
                                <li>Attempting to circumvent our payment system</li>
                                <li>Harassing or abusing other users or staff</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">7</span>
                            Limitation of Liability
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            Vastra Vows acts as a platform connecting renters and lenders. While we strive to ensure quality and safety,
                            we are not responsible for disputes between users. Our liability is limited to the amount paid for the specific transaction in question.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">8</span>
                            Changes to Terms
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            We reserve the right to modify these terms at any time. We will notify users of any material changes via email
                            or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-medium text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">9</span>
                            Contact Us
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-light pl-11">
                            If you have any questions about these Terms, please contact us at <a href="mailto:hello@vastravows.com" className="text-primary hover:underline font-medium">hello@vastravows.com</a> or +91-9981100245.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
