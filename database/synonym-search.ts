import nlp from 'compromise';

export function testModernSearch(query: string) {
    console.log(`--- Testing Modern NLP for: "${query}" ---`);

    const doc = nlp(query);
    
    // 1. Check for specific tags/categories
    const isElectronic = doc.match('#Electronic').found;
    const isFurniture = doc.match('#Furniture').found;

    // 2. Use a custom mapping for common marketplace "Parent" terms
    // This is much more reliable for a team project
    const marketplaceContext: Record<string, string[]> = {
        'laptop': ['computer', 'pc', 'macbook', 'tech'],
        'couch': ['sofa', 'furniture', 'seating'],
        'fridge': ['appliance', 'kitchen', 'refrigerator']
    };

    const expanded = marketplaceContext[query.toLowerCase()] || [];

    console.log(`Is Electronic: ${isElectronic}`);
    console.log(`Suggested Categories: ${expanded.join(', ')}`);
    console.log('-------------------------------------------\n');
}

testModernSearch("laptop");
testModernSearch("couch");