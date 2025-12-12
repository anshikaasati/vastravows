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
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-24 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-bg.png')] opacity-5"></div>
                <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
                    <h1 className="text-6xl md:text-8xl font-script text-primary/90 mb-4">Frequently Asked Questions</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide uppercase max-w-2xl mx-auto">
                        Your guide to a seamless luxury rental experience
                    </p>
                </div>
            </div>

            {/* FAQ Sections */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
                <div className="max-w-4xl mx-auto space-y-16">
                    {faqs.map((category, catIndex) => (
                        <div key={catIndex} className="space-y-8">
                            <h2 className="text-2xl font-display font-medium text-gray-900 border-b border-gray-200 pb-4">
                                {category.category}
                            </h2>
                            <div className="space-y-4">
                                {category.questions.map((item, qIndex) => {
                                    const isOpen = openIndex === `${catIndex}-${qIndex}`;
                                    return (
                                        <div key={qIndex} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                                            <button
                                                onClick={() => toggleQuestion(catIndex, qIndex)}
                                                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className={`font-medium text-lg pr-4 ${isOpen ? 'text-primary' : 'text-gray-900'}`}>{item.q}</span>
                                                {isOpen ? (
                                                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="px-8 pb-6 pt-0">
                                                    <p className="text-gray-600 leading-relaxed font-light">{item.a}</p>
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
            <div className="bg-[#fcf8f9] py-20 border-t border-[#f3e6ea]">
                <div className="container mx-auto px-4 text-center space-y-8">
                    <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900">Still Have Questions?</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Can't find what you're looking for? Our dedicated concierge team is here to assist you with any inquiries.
                    </p>
                    <a href="/contact" className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-[#d48496] to-[#760a1e] text-white text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
