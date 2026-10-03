export const ARTIST = {
  name: 'Elena Voss',
  studioName: 'Atelier Voss',
  tagline: 'Painter & ceramicist — handmade work in clay, pigment and thread',
  city: 'Paris',
  address: '14 Rue des Rosiers, 75004 Paris, France',
  email: 'studio@atelier-voss.com',
  phone: '+33 1 42 60 18 24',
  instagram: 'https://instagram.com/atelier.voss',
  pinterest: 'https://pinterest.com/ateliervoss',
};

export const CATEGORIES = [
  { name: 'Paintings', slug: 'paintings', description: 'Original oil and mixed-media paintings on linen and panel.' },
  { name: 'Ceramics', slug: 'ceramics', description: 'Hand-thrown stoneware vessels, bowls and sculptural forms.' },
  { name: 'Sculpture', slug: 'sculpture', description: 'Carved wood, bronze and assembled sculptural pieces.' },
  { name: 'Textile Art', slug: 'textile-art', description: 'Hand-woven tapestries and embroidered wall pieces.' },
  { name: 'Home Décor', slug: 'home-decor', description: 'Functional handmade objects for considered interiors.' },
];

export const ORDER_STATUSES = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'] as const;
export const COMMISSION_STATUSES = ['new', 'in_discussion', 'accepted', 'in_progress', 'completed', 'declined'] as const;
