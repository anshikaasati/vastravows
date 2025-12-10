import { Link } from 'react-router-dom';
import { Sparkles, Heart, Leaf, Users } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="absolute inset-0 bg-[url('/images/about-hero.jpg')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10 text-center space-y-4 px-4">
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-primary">Our Story</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Redefining luxury fashion through sustainable rentals</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
                {/* Mission Section */}
                <section className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-4xl font-display font-bold text-primary">Our Mission</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        At Vastra Vows, we believe that luxury fashion should be accessible, sustainable, and worry-free.
                        We're on a mission to transform how people experience premium clothing and accessories by making
                        high-end fashion rentals simple, affordable, and environmentally conscious.
                    </p>
                </section>

                {/* Values Grid */}
                <section className="grid md:grid-cols-3 gap-8">
                    <div className="glass-card p-8 rounded-3xl text-center space-y-4 hover:shadow-xl transition-shadow">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                            <Heart className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-2xl font-display font-semibold text-primary">Quality First</h3>
                        <p className="text-gray-600">
                            Every piece in our collection is carefully curated and maintained to ensure you look and feel your best.
                        </p>
                    </div>

                    <div className="glass-card p-8 rounded-3xl text-center space-y-4 hover:shadow-xl transition-shadow">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                            <Leaf className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-2xl font-display font-semibold text-primary">Sustainability</h3>
                        <p className="text-gray-600">
                            Reduce fashion waste by renting instead of buying. One dress, many occasions, minimal environmental impact.
                        </p>
                    </div>

                    <div className="glass-card p-8 rounded-3xl text-center space-y-4 hover:shadow-xl transition-shadow">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                            <Users className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-2xl font-display font-semibold text-primary">Community</h3>
                        <p className="text-gray-600">
                            Join a community of fashion lovers who share, care, and celebrate style together.
                        </p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-4xl font-display font-bold text-primary text-center">How We Started</h2>
                    <div className="glass-panel p-8 md:p-12 rounded-3xl space-y-6">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Vastra Vows was born from a simple observation: wardrobes are full of clothes worn only once,
                            while special occasions demand new outfits. We saw an opportunity to bridge this gap.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Founded in 2024, we started with a vision to make luxury fashion accessible to everyone while
                            promoting sustainable consumption. What began as a small collection of traditional wear has grown
                            into a comprehensive platform offering everything from ethnic wear to western outfits and accessories.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Today, we're proud to serve fashion enthusiasts across India, helping them shine at every occasion
                            without the burden of ownership. Our platform also empowers lenders to monetize their premium wardrobes,
                            creating a win-win ecosystem for everyone.
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center space-y-6 py-12">
                    <h2 className="text-3xl font-display font-bold text-primary">Ready to Experience Luxury?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Browse our curated collection and find the perfect outfit for your next special occasion.
                    </p>
                    <Link to="/items" className="inline-block px-8 py-4 btn-primary rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                        Explore Collection
                    </Link>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
