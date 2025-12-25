/**
 * Advanced Search Query Expansion System
 * 
 * maximizing recall while preserving relevance by expanding user queries 
 * across semantic dimensions (Gender, Category, Style, Material, Color, etc.)
 */

export const KEYWORD_MAPPING = {
    // --- Gender Mapping ---
    'boy': ['men', 'male', 'boys'],
    'boys': ['men', 'male', 'boy'],
    'gent': ['men', 'male', 'gents'],
    'gents': ['men', 'male', 'gent'],
    'guy': ['men', 'male'],
    'male': ['men', 'boy', 'gent'],
    'men': ['male', 'boy', 'gent'],

    'girl': ['women', 'female', 'girls'],
    'girls': ['women', 'female', 'girl'],
    'lady': ['women', 'female', 'ladies'],
    'ladies': ['women', 'female', 'lady'],
    'female': ['women', 'girl', 'lady'],
    'women': ['female', 'girl', 'lady'],

    'unisex': ['men', 'women', 'unisex'],
    'kid': ['kids', 'child', 'children'],
    'kids': ['kid', 'child', 'children'],
    'child': ['kids', 'kid'],
    'baby': ['newborn', 'infant', 'baby'],
    'infant': ['newborn', 'baby'],

    // --- Category Expansion ---
    'earring': ['jewellery', 'jewelry', 'earrings', 'accessories'],
    'earrings': ['jewellery', 'jewelry', 'earring', 'accessories'],
    'necklace': ['jewellery', 'jewelry', 'necklaces'],
    'ring': ['jewellery', 'jewelry', 'rings', 'accessories'],
    'bangle': ['jewellery', 'jewelry', 'bangles'],
    'bangles': ['jewellery', 'jewelry', 'bangle'],

    'watch': ['accessories', 'watches'],
    'belt': ['accessories', 'belts'],
    'cap': ['accessories', 'hats', 'caps'],
    'sunglasses': ['accessories', 'eyewear'],

    'shoe': ['shoes', 'footwear', 'sneaker', 'boot'],
    'shoes': ['shoe', 'footwear', 'sneakers', 'boots'],
    'sneaker': ['shoes', 'footwear', 'sneakers'],
    'sneakers': ['shoes', 'footwear', 'sneaker'],
    'boot': ['shoes', 'footwear', 'boots'],
    'boots': ['shoes', 'footwear', 'boot'],
    'sandal': ['shoes', 'footwear', 'sandals'],

    'shirt': ['tops', 'shirt', 'tshirt'],
    'tshirt': ['tops', 'shirt', 'tee'],
    'tee': ['tops', 'tshirt', 'shirt'],
    'top': ['tops', 'shirt', 'tshirt'],

    'jeans': ['bottoms', 'denim', 'pants', 'trousers'],
    'trouser': ['bottoms', 'pants', 'trousers', 'formal'],
    'trousers': ['bottoms', 'pants', 'trouser', 'formal'],
    'pant': ['bottoms', 'pants', 'trousers'],
    'pants': ['bottoms', 'pant', 'trousers'],

    'sari': ['saree', 'traditional', 'ethnic'],
    'saree': ['sari', 'traditional', 'ethnic'],
    'lehenga': ['lehanga', 'traditional', 'ethnic', 'ghagra'],
    'lehanga': ['lehenga', 'traditional', 'ethnic', 'ghagra'],
    'kurta': ['kurti', 'ethnic', 'traditional'],
    'sherwani': ['ethnic', 'traditional', 'men'],

    'suit': ['western', 'formal', 'traditional', 'blazer'],
    'blazer': ['suit', 'formal', 'western', 'jacket'],
    'gown': ['western', 'dress', 'formal'],
    'frock': ['western', 'dress'],
    'dress': ['western', 'gown', 'frock'],

    // --- Fashion & Style Semantics ---
    'casual': ['dailywear', 'casual'],
    'dailywear': ['casual'],
    'party': ['festive', 'occasion', 'partywear'],
    'festive': ['party', 'occasion', 'traditional'],
    'office': ['formal', 'workwear', 'professional'],
    'formal': ['office', 'workwear', 'professional'],
    'wedding': ['bridal', 'festive', 'marriage'],
    'bridal': ['wedding', 'festive'],
    'summer': ['lightweight', 'cotton', 'summer'],
    'winter': ['wool', 'warm', 'jacket', 'winter'],
    'luxury': ['premium', 'designer', 'expensive'],
    'premium': ['luxury', 'designer', 'high-end'],
    'cheap': ['budget', 'affordable', 'low-cost'],
    'budget': ['cheap', 'affordable'],

    // --- Material Expansion ---
    'gold': ['gold', 'metal', 'precious', 'golden'],
    'silver': ['silver', 'metal', 'white'],
    'cotton': ['breathable', 'fabric', 'cotton'],
    'silk': ['luxury', 'fabric', 'smooth'],
    'leather': ['premium', 'leather'],
    'denim': ['jeans', 'blue'],

    // --- Color Expansion ---
    'red': ['maroon', 'burgundy', 'crimson', 'ruby'],
    'maroon': ['red', 'burgundy'],
    'blue': ['navy', 'skyblue', 'azure', 'indigo'],
    'navy': ['blue', 'dark'],
    'black': ['dark', 'jet', 'charcoal'],
    'white': ['offwhite', 'ivory', 'cream', 'pearl'],
    'green': ['emerald', 'olive', 'lime'],
    'pink': ['rose', 'blush', 'magenta'],
    'yellow': ['ochre', 'mustard', 'gold'],

    // --- Cultural & Regional ---
    'desi': ['traditional', 'ethnic', 'indian'],
    'ethnic': ['traditional', 'desi', 'cultural'],
    'indo-western': ['fusion', 'contemporary'],
    'western': ['modern', 'contemporary'],

    // --- Synonyms & Variants ---
    'bag': ['handbag', 'purse', 'tote', 'clutch'],
    'handbag': ['bag', 'purse'],
    'purse': ['bag', 'handbag', 'wallet'],
    'phone': ['mobile', 'smartphone'],
    'mobile': ['phone', 'smartphone'],
    'laptop': ['notebook', 'computer'],
    'tv': ['television']
};

/**
 * Builds a MongoDB-compatible query object with expanded search terms.
 * 
 * Logic:
 * 1. Tokenize query (lowercase, remove punctuation, split).
 * 2. Deduplicate tokens.
 * 3. Expand each token using KEYWORD_MAPPING.
 * 4. Construct Query: (Expansion_Token_1) AND (Expansion_Token_2) ...
 *    Where (Expansion_Token) is an OR of all its variants across all fields.
 * 
 * @param {string} searchString - The raw user search query
 * @returns {Object} - MongoDB query object (e.g. { $and: [...] }) or empty object
 */
export const buildExpandedSearchQuery = (searchString) => {
    if (!searchString || typeof searchString !== 'string') {
        return {};
    }

    // 1. Tokenization & Normalization
    // Lowercase, replace special chars with space, split by whitespace
    const normalizedQuery = searchString.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const rawTokens = normalizedQuery.split(/\s+/).filter(t => t.trim().length > 0);

    // Deduplicate
    const uniqueTokens = [...new Set(rawTokens)];

    if (uniqueTokens.length === 0) {
        return {};
    }

    // Fields to search in
    // We apply the regex to ALL these fields for maximum recall
    const searchFields = [
        'title',
        'description',
        'gender',
        'category',
        'subcategory',
        'size',
        'location.city',
        'addressLine' // Added address for better location search
    ];

    // 2. Build the $and array
    // Each element in $and corresponds to one USER token (expanded)
    const andConditions = uniqueTokens.map(token => {
        // Get synonyms/variants for this token
        // If "boy" -> ["men", "male", "boys"]
        // We add the token itself to the list as well
        const variants = KEYWORD_MAPPING[token] || [];

        // Combine original token + variants, deduplicate again
        const allTermVariants = [...new Set([token, ...variants])];

        // Create regexes for all variants
        // Using simple regex for partial match. 
        // Optimization: Pre-compile regexes if this was a class, but functional is fine.
        const regexes = allTermVariants.map(term => new RegExp(term, 'i'));

        // Construct the $or block for this token
        // Match ANY variant in ANY field
        const orConditions = regexes.flatMap(regex =>
            searchFields.map(field => ({ [field]: regex }))
        );

        return { $or: orConditions };
    });

    return { $and: andConditions };
};
