import { Link } from 'react-router-dom';
import { Sparkles, Heart, Leaf, Users } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-24 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-bg.png')] opacity-5"></div>
                <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
                    <h1 className="text-6xl md:text-8xl font-script text-primary/90 mb-4">Our Story</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide uppercase max-w-2xl mx-auto">
                        Redefining luxury fashion through sustainable rentals
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20 space-y-20">
                {/* Mission Section */}
                <section className="max-w-4xl mx-auto text-center space-y-8 bg-white p-10 rounded-xl shadow-xl border border-gray-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/5 text-primary mb-4">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-display font-medium text-gray-900">Our Mission</h2>
                    <p className="text-lg text-gray-600 leading-relaxed font-light">
                        At Vastra Vows, we believe that luxury fashion should be <span className="text-primary font-medium">accessible</span>, <span className="text-primary font-medium">sustainable</span>, and <span className="text-primary font-medium">worry-free</span>.
                        We're on a mission to transform how people experience premium clothing and accessories by making
                        high-end fashion rentals simple, affordable, and environmentally conscious.
                    </p>
                </section>

                {/* Values Grid */}
                <section className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Heart, title: 'Quality First', desc: 'Every piece in our collection is carefully curated and maintained to ensure you look and feel your best.' },
                        { icon: Leaf, title: 'Sustainability', desc: 'Reduce fashion waste by renting instead of buying. One dress, many occasions, minimal environmental impact.' },
                        { icon: Users, title: 'Community', desc: 'Join a community of fashion lovers who share, care, and celebrate style together.' }
                    ].map((item, index) => (
                        <div key={index} className="glass-card p-10 rounded-xl text-center space-y-6 hover:shadow-2xl transition-all duration-300 group border border-white/60">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-display font-medium text-gray-900">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-light">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Story Section */}
                <section className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center">
                        <h2 className="text-4xl md:text-5xl font-display font-medium text-gray-900 mb-4">How We Started</h2>
                        <div className="w-24 h-1 bg-primary/20 mx-auto rounded-xl"></div>
                    </div>
                    <div className="relative p-10 md:p-14 rounded-xl bg-white border border-gray-100 shadow-lg space-y-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/5 to-transparent rounded-bl-xl"></div>

                        <p className="text-lg text-gray-700 leading-relaxed font-light relative z-10">
                            Vastra Vows was born from a simple observation: wardrobes are full of clothes worn only once,
                            while special occasions demand new outfits. We saw an opportunity to bridge this gap.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed font-light relative z-10">
                            Founded in 2024, we started with a vision to make luxury fashion accessible to everyone while
                            promoting sustainable consumption. What began as a small collection of traditional wear has grown
                            into a comprehensive platform offering everything from ethnic wear to western outfits and accessories.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed font-light relative z-10">
                            Today, we're proud to serve fashion enthusiasts across India, helping them shine at every occasion
                            without the burden of ownership. Our platform also empowers lenders to monetize their premium wardrobes,
                            creating a win-win ecosystem for everyone.
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center space-y-8 py-10">
                    <h2 className="text-3xl font-display font-medium text-gray-900">Ready to Experience Luxury?</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-light">
                        Browse our curated collection and find the perfect outfit for your next special occasion.
                    </p>
                    <Link to="/items" className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        Explore Collection
                    </Link>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
