import { Check } from 'lucide-react';

const PricingPage = () => {
    const rentalInfo = [
        { feature: 'Daily rental rates starting from ₹500', included: true },
        { feature: 'Free delivery on orders above ₹2000', included: true },
        { feature: 'Optional damage protection available', included: true },
        { feature: 'Flexible rental periods (1-7 days)', included: true },
        { feature: 'Professional cleaning included', included: true },
        { feature: 'Easy returns with prepaid labels', included: true }
    ];

    const lenderPlans = [
        {
            name: 'Basic',
            price: '₹499',
            period: '/month',
            features: [
                'List up to 10 items',
                '70% revenue share',
                'Basic analytics',
                'Email support',
                'Standard listing visibility'
            ],
            popular: false
        },
        {
            name: 'Pro',
            price: '₹999',
            period: '/month',
            features: [
                'List up to 50 items',
                '75% revenue share',
                'Advanced analytics',
                'Priority support',
                'Featured listing placement',
                'Marketing tools'
            ],
            popular: true
        },
        {
            name: 'Enterprise',
            price: '₹2499',
            period: '/month',
            features: [
                'Unlimited listings',
                '80% revenue share',
                'Premium analytics dashboard',
                'Dedicated account manager',
                'Top listing placement',
                'Custom branding options',
                'API access'
            ],
            popular: false
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-primary">Transparent Pricing</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Simple, fair pricing for renters and lenders. No hidden fees.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
                {/* Rental Pricing */}
                <section className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-display font-bold text-primary text-center mb-12">For Renters</h2>
                    <div className="glass-card p-8 md:p-12 rounded-3xl">
                        <h3 className="text-2xl font-display font-semibold text-primary mb-6">How Rental Pricing Works</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Each item has its own daily rental rate set by the lender. You pay only for the days you rent,
                            plus a refundable security deposit. Delivery charges apply based on your location.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {rentalInfo.map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{item.feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Lender Plans */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-display font-bold text-primary mb-4">For Lenders</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose a plan that fits your inventory size and earn passive income from your wardrobe.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {lenderPlans.map((plan, index) => (
                            <div
                                key={index}
                                className={`glass-card rounded-3xl p-8 relative ${plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-display font-bold text-primary mb-4">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-display font-bold text-primary">{plan.price}</span>
                                        <span className="text-gray-500">{plan.period}</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular
                                        ? 'btn-primary text-white shadow-lg hover:shadow-xl'
                                        : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                                    }`}>
                                    Choose {plan.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Additional Info */}
                <section className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl">
                    <h3 className="text-2xl font-display font-semibold text-primary mb-6">Additional Information</h3>
                    <div className="space-y-4 text-gray-600">
                        <p><strong className="text-primary">Security Deposit:</strong> A refundable deposit (usually 20-30% of item value) is held during rental and released after return.</p>
                        <p><strong className="text-primary">Delivery Charges:</strong> ₹100-300 depending on location. Free for orders above ₹2000.</p>
                        <p><strong className="text-primary">Late Fees:</strong> ₹200/day for late returns to ensure fairness to all users.</p>
                        <p><strong className="text-primary">Damage Protection:</strong> Optional coverage available at 10% of rental value.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PricingPage;
