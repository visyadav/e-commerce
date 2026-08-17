export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  badge?: string;
  discountPercentage?: string;
  rating?: number;
  reviewsCount?: number;
  imageUrl: string;
  category: string;
}

export const PRODUCTS_DATA: ProductItem[] = [
  {
    id: '1',
    name: 'Pure Organic Farm Cow Milk',
    price: 36,
    originalPrice: 42,
    unit: '500 ml',
    discountPercentage: '14% OFF',
    rating: 4.8,
    reviewsCount: 1420,
    category: 'Fresh Milk',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '2',
    name: 'Fresh Buffalo Full Cream Milk',
    price: 46,
    originalPrice: 52,
    unit: '500 ml',
    discountPercentage: '11% OFF',
    rating: 4.9,
    reviewsCount: 980,
    category: 'Fresh Milk',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '3',
    name: 'High Protein Natural Cow Milk',
    price: 45,
    originalPrice: 50,
    unit: '500 ml',
    badge: 'HIGH PROTEIN',
    rating: 4.7,
    reviewsCount: 810,
    category: 'Fresh Milk',
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '4',
    name: 'Farm Fresh Artisan Paneer',
    price: 95,
    originalPrice: 110,
    unit: '200 g',
    badge: 'BESTSELLER',
    discountPercentage: '15% OFF',
    rating: 4.9,
    reviewsCount: 2300,
    category: 'Paneer & Butter',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '5',
    name: 'Country Special Low Fat Milk',
    price: 32.5,
    originalPrice: 38,
    unit: '500 ml',
    rating: 4.6,
    reviewsCount: 540,
    category: 'Fresh Milk',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '6',
    name: 'Desi Gir A2 Cow Milk',
    price: 93,
    originalPrice: 105,
    unit: '1 Litre',
    badge: 'PURE A2',
    rating: 5.0,
    reviewsCount: 3100,
    category: 'Fresh Milk',
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '7',
    name: 'Thick Creamy Set Dahi',
    price: 40,
    originalPrice: 48,
    unit: '400 g',
    rating: 4.8,
    reviewsCount: 1650,
    category: 'Curd & Lassi',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '8',
    name: 'Unsweetened Oat Beverage',
    price: 135,
    originalPrice: 160,
    unit: '1 Litre',
    badge: 'VEGAN',
    discountPercentage: '16% OFF',
    rating: 4.7,
    reviewsCount: 420,
    category: 'Plant Based',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
  },
];
