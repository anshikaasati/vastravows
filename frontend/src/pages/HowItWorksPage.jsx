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
        <div className="min-h-screen bg-[#fcf8f9]">
            {/* Hero */}
            <div className="relative overflow-hidden py-24">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
                    <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Simple & Seamless</span>
                    <h1 className="text-6xl md:text-8xl font-script text-primary/90">How it Works</h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Renting luxury fashion has never been easier. We've simplified the process so you can focus on looking your best.
                    </p>
                </div>
            </div>

            {/* Steps Timeline */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="max-w-5xl mx-auto space-y-12">
                    {steps.map((step, index) => (
                        <div key={index} className="group relative">
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-10 md:left-1/2 top-24 bottom-0 w-px bg-gradient-to-b from-primary/20 to-transparent md:-ml-px h-full z-0 hidden md:block"></div>
                            )}

                            <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 relative z-10 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                                {/* Content Card */}
                                <div className="flex-1 w-full">
                                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 text-center md:text-left group-hover:border-primary/20">
                                        <div className="inline-block p-4 rounded-xl bg-gray-50 mb-6 group-hover:bg-primary/5 transition-colors">
                                            <step.icon className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-display font-medium text-gray-900 mb-4">{step.title}</h3>
                                        <p className="text-gray-500 leading-relaxed font-light">{step.description}</p>
                                    </div>
                                </div>

                                {/* Number Indicator */}
                                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white border-4 border-[#fcf8f9] shadow-lg flex items-center justify-center relative z-10">
                                    <span className="text-2xl font-script font-bold text-primary">{index + 1}</span>
                                </div>

                                {/* Spacer for alternate layout */}
                                <div className="flex-1 hidden md:block"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* For Lenders Section */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-24 border-y border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Join the Community</span>
                        <h2 className="text-4xl md:text-5xl font-display font-medium text-gray-900">Become a Lender</h2>
                        <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto">
                            Have premium clothing sitting in your wardrobe? Turn them into income by listing them on Vastra Vows.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 mt-16">
                            {[
                                { num: '01', title: 'Create Listing', desc: 'Upload styled photos and add details' },
                                { num: '02', title: 'Set Price', desc: 'Control your rates and availability' },
                                { num: '03', title: 'Earn Money', desc: 'Get paid secure & fast' }
                            ].map((item, i) => (
                                <div key={i} className="p-8 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                                    <div className="text-5xl font-script text-primary/20 mb-4">{item.num}</div>
                                    <h4 className="font-display font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Link to="/register" className="inline-block px-10 py-4 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                Start Lending
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-12 md:p-20 relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-script text-primary mb-6">Ready to look stunning?</h2>
                        <p className="text-gray-900 text-lg max-w-xl mx-auto font-light">Join thousands of happy customers who are redefining their wardrobe with Vastra Vows.</p>
                        <Link to="/items" className="inline-block px-10 py-5 bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all">
                            Browse Collection
                        </Link>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksPage;
