
import fs from 'fs';
import path from 'path';

const ITEMS_FILE = path.join(process.cwd(), 'tmp/work-data/raw/items.json');

const targetIds = ['IM2o', 'IM1y', 'IM4!'];

try {
    if (!fs.existsSync(ITEMS_FILE)) {
        console.error(`File not found: ${ITEMS_FILE}`);
        process.exit(1);
    }

    const content = fs.readFileSync(ITEMS_FILE, 'utf-8');
    const data = JSON.parse(content);

    console.log('Data type:', typeof data);

    let items: any[] = [];
    if (Array.isArray(data)) {
        items = data;
    } else if (data.items && Array.isArray(data.items)) {
        items = data.items;
    }

    if (items.length > 0) {
        console.log(`Found ${items.length} items.`);
        console.log('First item sample:', JSON.stringify(items[0], null, 2));

        console.log('\nSearching for target IDs...');
        targetIds.forEach(id => {
            // Try to find by id or some other field
            // Check common fields for 4-char code
            const item = items.find((i: any) =>
                i.id === id ||
                i.code === id ||
                i.rawId === id ||
                (i.abilities && i.abilities.includes(id)) // unlikely but possible
            );

            if (item) {
                console.log(`Found ${id}: ${item.name} (ID: ${item.id})`);
            } else {
                console.log(`Could not find item with ID ${id}`);
                // Deep search in string representation
                const found = items.find((i: any) => JSON.stringify(i).includes(id));
                if (found) {
                    console.log(`Found ${id} in item: ${found.name} (ID: ${found.id})`);
                    // Print the part that matched
                    const str = JSON.stringify(found);
                    const idx = str.indexOf(id);
                    console.log('Context:', str.substring(Math.max(0, idx - 20), Math.min(str.length, idx + 20)));
                }
            }
        });
    } else {
        console.log('No items array found');
        console.log('Keys:', Object.keys(data));
    }

} catch (error) {
    console.error('Error reading items file:', error);
}
