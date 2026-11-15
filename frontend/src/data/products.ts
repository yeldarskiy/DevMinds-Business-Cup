import type { Category, Product } from '../types'

export const CATEGORIES: Category[] = ['Groceries', 'Household', 'Baby & Kids', 'Health & Pharmacy']

export const PRODUCTS: Product[] = [
  { id: 'milk', name: 'Milk', brand: 'Fairlife', variant: '2% Ultra-Filtered', category: 'Groceries', size: '52 fl oz', perishable: true },
  { id: 'eggs', name: 'Eggs', brand: "Eggland's Best", variant: 'Large Grade A', category: 'Groceries', size: '12 ct', perishable: true },
  { id: 'bread', name: 'Bread', brand: "Nature's Own", variant: 'Honey Wheat', category: 'Groceries', size: '20 oz', perishable: true },
  { id: 'peanut-butter', name: 'Peanut Butter', brand: 'Jif', variant: 'Creamy', category: 'Groceries', size: '16 oz', perishable: false },
  { id: 'rice', name: 'Rice', brand: 'Mahatma', variant: 'Long Grain White', category: 'Groceries', size: '5 lb', perishable: false },
  { id: 'pasta', name: 'Pasta', brand: 'Barilla', variant: 'Spaghetti', category: 'Groceries', size: '16 oz', perishable: false },
  { id: 'coffee', name: 'Coffee', brand: 'Folgers', variant: 'Classic Roast Ground', category: 'Groceries', size: '25.9 oz', perishable: false },
  { id: 'bananas', name: 'Bananas', brand: 'Chiquita', variant: 'Bunch of 6', category: 'Groceries', size: '≈2.5 lb', perishable: true },
  { id: 'apples', name: 'Apples', brand: 'Honeycrisp', variant: 'Bagged', category: 'Groceries', size: '3 lb', perishable: true },
  { id: 'chicken-breast', name: 'Chicken Breast', brand: 'Tyson', variant: 'Boneless Skinless', category: 'Groceries', size: '2.5 lb', perishable: true },
  { id: 'snacks', name: 'Snacks', brand: 'Goldfish', variant: 'Cheddar Crackers', category: 'Groceries', size: '6.6 oz', perishable: false },
  { id: 'fresh-produce', name: 'Fresh Produce', brand: 'Earthbound Farm', variant: 'Organic Spring Mix', category: 'Groceries', size: '16 oz', perishable: true },

  { id: 'laundry-detergent', name: 'Laundry Detergent', brand: 'Tide', variant: 'Original Liquid, 64 loads', category: 'Household', size: '92 fl oz', perishable: false },
  { id: 'dish-soap', name: 'Dish Soap', brand: 'Dawn', variant: 'Ultra Original', category: 'Household', size: '19.4 fl oz', perishable: false },
  { id: 'toilet-paper', name: 'Toilet Paper', brand: 'Charmin', variant: 'Ultra Soft Mega Rolls', category: 'Household', size: '12 ct', perishable: false },
  { id: 'paper-towels', name: 'Paper Towels', brand: 'Bounty', variant: 'Select-A-Size Double Rolls', category: 'Household', size: '6 ct', perishable: false },
  { id: 'trash-bags', name: 'Trash Bags', brand: 'Glad', variant: 'ForceFlex 13 gal', category: 'Household', size: '40 ct', perishable: false },
  { id: 'cleaning-sponges', name: 'Cleaning Sponges', brand: 'Scotch-Brite', variant: 'Non-Scratch Scrub', category: 'Household', size: '6 ct', perishable: false },

  { id: 'diapers', name: 'Diapers', brand: 'Pampers', variant: 'Swaddlers, Size 2', category: 'Baby & Kids', size: '84 ct', perishable: false },
  { id: 'baby-wipes', name: 'Baby Wipes', brand: 'Huggies', variant: 'Natural Care, 3 pack', category: 'Baby & Kids', size: '168 ct', perishable: false },
  { id: 'baby-shampoo', name: 'Baby Shampoo', brand: "Johnson's", variant: 'Tear-Free', category: 'Baby & Kids', size: '13.6 fl oz', perishable: false },
  { id: 'baby-formula', name: 'Baby Formula', brand: 'Similac', variant: '360 Total Care Powder', category: 'Baby & Kids', size: '30.8 oz', perishable: false },
  { id: 'baby-food', name: 'Baby Food', brand: 'Gerber', variant: '2nd Foods Veggie Variety', category: 'Baby & Kids', size: '8 × 4 oz', perishable: false },

  { id: 'bandages', name: 'Bandages', brand: 'Band-Aid', variant: 'Flexible Fabric', category: 'Health & Pharmacy', size: '30 ct', perishable: false },
  { id: 'thermometer', name: 'Thermometer', brand: 'Vicks', variant: 'SpeedRead Digital', category: 'Health & Pharmacy', size: '1 ct', perishable: false },
  { id: 'pain-relief', name: 'Pain Relief', brand: 'Tylenol', variant: 'Extra Strength Caplets', category: 'Health & Pharmacy', size: '100 ct', perishable: false },
  { id: 'first-aid-kit', name: 'First Aid Kit', brand: 'Johnson & Johnson', variant: 'All-Purpose, 140 pieces', category: 'Health & Pharmacy', size: '1 kit', perishable: false },
  { id: 'sunscreen', name: 'Sunscreen', brand: 'Banana Boat', variant: 'Sport Ultra SPF 50', category: 'Health & Pharmacy', size: '8 fl oz', perishable: false },
  { id: 'vitamins', name: 'Vitamins', brand: 'Centrum', variant: 'Adult Multivitamin', category: 'Health & Pharmacy', size: '200 ct', perishable: false },
]

const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]))

export function registerBackendProducts(products: Product[]): void {
  for (const product of products) PRODUCT_MAP.set(product.id, product)
}

export function getProduct(id: string): Product | undefined {
  return PRODUCT_MAP.get(id)
}

/** Reference US shelf prices (USD) used to derive the demo price table. */
export const BASE_PRICES: Record<string, number> = {
  milk: 4.79,
  eggs: 4.49,
  bread: 3.49,
  'peanut-butter': 3.39,
  rice: 5.49,
  pasta: 1.89,
  coffee: 11.99,
  bananas: 1.79,
  apples: 5.99,
  'chicken-breast': 11.49,
  snacks: 2.79,
  'fresh-produce': 5.99,
  'laundry-detergent': 13.99,
  'dish-soap': 3.99,
  'toilet-paper': 18.99,
  'paper-towels': 15.49,
  'trash-bags': 10.99,
  'cleaning-sponges': 5.49,
  diapers: 29.99,
  'baby-wipes': 7.49,
  'baby-shampoo': 5.99,
  'baby-formula': 46.99,
  'baby-food': 7.99,
  bandages: 4.99,
  thermometer: 11.99,
  'pain-relief': 12.99,
  'first-aid-kit': 17.99,
  sunscreen: 9.99,
  vitamins: 19.49,
}

/** Five everyday staples used by "View demo" and the landing preview. */
export const DEMO_BASKET = [
  { productId: 'milk', quantity: 1 },
  { productId: 'eggs', quantity: 1 },
  { productId: 'bread', quantity: 1 },
  { productId: 'peanut-butter', quantity: 1 },
  { productId: 'bananas', quantity: 1 },
]
