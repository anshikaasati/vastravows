import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Calendar, Package, CheckCircle, ArrowRight } from 'lucide-react';

const HowItWorksPage = () => {
    const steps = [
        {
            icon: Search,
            title: 'Browse & Discover',
            description: 'Explore our curated collection of premium clothing and accessories. Filter by occasion, style, or size to find your perfect match.',
            color: 'from-primary to-primary-dark'
        },
        {
            icon: Calendar,
            title: 'Select Dates',
            description: 'Choose your rental period and check availability. Our calendar shows real-time availability for hassle-free booking.',
            color: 'from-secondary to-yellow-600'
        },
        {
            icon: ShoppingBag,
            title: 'Book & Pay',
            description: 'Add items to cart, complete secure payment, and receive instant confirmation. We accept all major payment methods.',
            color: 'from-primary to-primary-dark'
        },
        {
            icon: Package,
            title: 'Receive & Enjoy',
            description: 'Get your items delivered to your doorstep. Wear them with confidence at your special occasion.',
            color: 'from-secondary to-yellow-600'
        },
        {
            icon: CheckCircle,
            title: 'Return Easily',
            description: 'Return items after your event using our prepaid shipping label. No dry cleaning required!',
            color: 'from-primary to-primary-dark'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-primary">How It Works</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Renting luxury fashion has never been easier. Follow these simple steps to elevate your style.
                    </p>
                </div>
            </div>

            {/* Steps Timeline */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-5xl mx-auto space-y-16">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-center gap-8">
                            {/* Step Number & Icon */}
                            <div className="flex-shrink-0">
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}>
                                    <step.icon className="w-12 h-12 text-white" />
                                </div>
                                <div className="text-center mt-4">
                                    <span className="text-3xl font-display font-bold text-primary">0{index + 1}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 glass-card p-8 rounded-3xl">
                                <h3 className="text-2xl font-display font-bold text-primary mb-4">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                            </div>

                            {/* Arrow (except last) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block">
                                    <ArrowRight className="w-8 h-8 text-secondary" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* For Lenders Section */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl font-display font-bold text-primary">Become a Lender</h2>
                        <p className="text-lg text-gray-600">
                            Have premium clothing sitting in your wardrobe? Turn them into income by listing them on Vastra Vows.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 mt-12">
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-4xl font-display font-bold text-primary mb-2">01</div>
                                <h4 className="font-semibold text-lg mb-2">Create Listing</h4>
                                <p className="text-sm text-gray-600">Upload photos and details of your items</p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-4xl font-display font-bold text-primary mb-2">02</div>
                                <h4 className="font-semibold text-lg mb-2">Set Your Price</h4>
                                <p className="text-sm text-gray-600">Choose rental rates and availability</p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-4xl font-display font-bold text-primary mb-2">03</div>
                                <h4 className="font-semibold text-lg mb-2">Earn Money</h4>
                                <p className="text-sm text-gray-600">Get paid when your items are rented</p>
                            </div>
                        </div>
                        <Link to="/register" className="inline-block px-8 py-4 btn-primary rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all mt-8">
                            Start Lending Today
                        </Link>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-display font-bold text-primary mb-6">Ready to Get Started?</h2>
                <Link to="/items" className="inline-block px-8 py-4 btn-primary rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                    Browse Collection
                </Link>
            </div>
        </div>
    );
};

export default HowItWorksPage;
