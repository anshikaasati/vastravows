import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: 'Rentals',
            questions: [
                {
                    q: 'How long can I rent an item?',
                    a: 'You can rent items for a minimum of 1 day up to 7 days. For longer periods, please contact our support team.'
                },
                {
                    q: 'What if the item doesn\'t fit?',
                    a: 'We provide detailed size charts for each item. If you\'re unsure, you can contact us before booking. Size exchanges are not available after delivery.'
                },
                {
                    q: 'Can I extend my rental period?',
                    a: 'Yes! If the item is available, you can extend your rental through your bookings page. Extension charges will apply.'
                },
                {
                    q: 'What happens if I damage an item?',
                    a: 'Minor wear and tear is expected. For significant damage, a damage fee may apply based on repair costs. We recommend purchasing damage protection at checkout.'
                }
            ]
        },
        {
            category: 'Payments',
            questions: [
                {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway.'
                },
                {
                    q: 'When will I be charged?',
                    a: 'Payment is processed immediately upon booking confirmation. A security deposit may be held and released after item return.'
                },
                {
                    q: 'Is my payment information secure?',
                    a: 'Absolutely! We use industry-standard encryption and never store your complete card details. All payments are processed through secure payment gateways.'
                },
                {
                    q: 'What is your refund policy?',
                    a: 'Cancellations made 48 hours before rental start date receive full refund. Cancellations within 48 hours are subject to a 50% cancellation fee.'
                }
            ]
        },
        {
            category: 'Returns',
            questions: [
                {
                    q: 'How do I return items?',
                    a: 'Pack items in the original packaging and use the prepaid return label provided. Schedule a pickup or drop at any courier location.'
                },
                {
                    q: 'Do I need to dry clean items before returning?',
                    a: 'No! We handle all cleaning professionally. Just return items in the condition you received them.'
                },
                {
                    q: 'What if I return items late?',
                    a: 'Late returns incur a daily late fee. Please contact us immediately if you need to extend your rental period.'
                }
            ]
        },
        {
            category: 'For Lenders',
            questions: [
                {
                    q: 'How do I become a lender?',
                    a: 'Sign up, enable lender mode in your profile, and subscribe to a lender plan. Then you can start listing your items!'
                },
                {
                    q: 'How much can I earn?',
                    a: 'Earnings depend on your item\'s rental price and demand. You set your own prices and keep 70-80% of rental fees after platform commission.'
                },
                {
                    q: 'What if my item gets damaged?',
                    a: 'All rentals include damage protection. You\'ll be compensated for any damage beyond normal wear and tear.'
                },
                {
                    q: 'When do I receive payment?',
                    a: 'Payments are processed within 7 days after the renter returns the item and it passes quality inspection.'
                }
            ]
        }
    ];

    const toggleQuestion = (categoryIndex, questionIndex) => {
        const index = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-primary">Frequently Asked Questions</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Find answers to common questions about renting, payments, and more.
                    </p>
                </div>
            </div>

            {/* FAQ Sections */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-4xl mx-auto space-y-12">
                    {faqs.map((category, catIndex) => (
                        <div key={catIndex} className="space-y-6">
                            <h2 className="text-3xl font-display font-bold text-primary border-b-2 border-secondary pb-4">
                                {category.category}
                            </h2>
                            <div className="space-y-4">
                                {category.questions.map((item, qIndex) => {
                                    const isOpen = openIndex === `${catIndex}-${qIndex}`;
                                    return (
                                        <div key={qIndex} className="glass-card rounded-2xl overflow-hidden">
                                            <button
                                                onClick={() => toggleQuestion(catIndex, qIndex)}
                                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                                            >
                                                <span className="font-semibold text-lg text-gray-800 pr-4">{item.q}</span>
                                                {isOpen ? (
                                                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-5 pt-2">
                                                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Still Have Questions */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h2 className="text-3xl font-display font-bold text-primary">Still Have Questions?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <a href="/contact" className="inline-block px-8 py-4 btn-primary rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
