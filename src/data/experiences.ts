/**
 * The operator's product catalogue. Shared by the mock website (cards, detail pages,
 * checkout) and the CRM (Experience column, filter), exactly as a real Tripworks
 * operator's catalogue would feed both their booking site and their CRM.
 */
export interface Review {
  author: string;
  rating: number;
  text: string;
}

export interface Experience {
  id: string;
  name: string;
  tagline: string;
  price: number;
  rating: number;
  reviewCount: number;
  duration: string;
  image: string;
  description: string;
  highlights: string[];
  reviews: Review[];
}

export const EXPERIENCES: Experience[] = [
  {
    id: 'luau',
    name: 'Hawaiian Luau',
    tagline: 'Sunset feast, fire dancers & live music',
    price: 250,
    rating: 4.9,
    reviewCount: 412,
    duration: '3.5 hours',
    image: '/images/luau.svg',
    description:
      'An oceanfront evening of Polynesian storytelling, a traditional imu-roasted feast and a fire-knife finale under the stars.',
    highlights: ['Open bar & lei greeting', 'Imu pig unveiling', 'Front-row seating upgrade'],
    reviews: [
      { author: 'Hannah K.', rating: 5, text: 'The fire dancers were unreal. Worth every penny.' },
      { author: 'Marcus T.', rating: 5, text: 'Food was incredible and the staff made our anniversary special.' },
      { author: 'Lena P.', rating: 4, text: 'Beautiful setting. Book the front-row upgrade!' },
    ],
  },
  {
    id: 'kayaking',
    name: 'Kayaking',
    tagline: 'Paddle with sea turtles along Makena coast',
    price: 150,
    rating: 4.8,
    reviewCount: 638,
    duration: '3 hours',
    image: '/images/kayaking.svg',
    description:
      'Glide over crystal reefs in stable two-person kayaks, then snorkel Turtle Town with a certified guide. Perfect for first-timers.',
    highlights: ['Sea turtle sightings almost guaranteed', 'Snorkel gear & GoPro photos included', 'Small groups (max 12)'],
    reviews: [
      { author: 'Priya S.', rating: 5, text: 'We saw 9 turtles! Our guide Kai was amazing with the kids.' },
      { author: 'Jordan M.', rating: 5, text: 'Calm water, stunning reef, great photos included.' },
      { author: 'Chris D.', rating: 4, text: 'Early start but so worth it — the water is glassy at 7am.' },
    ],
  },
  {
    id: 'hiking',
    name: 'Hiking',
    tagline: 'Waterfalls & bamboo forest on the Road to Hana',
    price: 125,
    rating: 4.9,
    reviewCount: 291,
    duration: '5 hours',
    image: '/images/hiking.svg',
    description:
      'A guided rainforest trek through towering bamboo to a 400-foot waterfall, with a picnic lunch and swimming hole stop.',
    highlights: ['Pipiwai Trail & Waimoku Falls', 'Picnic lunch included', 'Hotel pickup'],
    reviews: [
      { author: 'Sam R.', rating: 5, text: 'Bamboo forest felt like another planet.' },
      { author: 'Ava L.', rating: 5, text: 'Guide knew every plant. Swimming hole was the highlight.' },
    ],
  },
  {
    id: 'biking',
    name: 'Biking',
    tagline: 'Sunrise descent from Haleakalā summit',
    price: 180,
    rating: 4.7,
    reviewCount: 356,
    duration: '6 hours',
    image: '/images/biking.svg',
    description:
      'Watch sunrise above the clouds at 10,023 ft, then coast 23 miles downhill through upcountry ranches and farm towns.',
    highlights: ['Summit sunrise permit included', 'Premium downhill bikes', 'Breakfast in Makawao'],
    reviews: [
      { author: 'Tyler B.', rating: 5, text: 'Sunrise above the clouds is a bucket-list moment.' },
      { author: 'Nina G.', rating: 4, text: 'Bring layers — it is freezing at the top!' },
    ],
  },
  {
    id: 'fishing',
    name: 'Fishing',
    tagline: 'Deep-sea sportfishing for mahi-mahi & ahi',
    price: 350,
    rating: 4.8,
    reviewCount: 184,
    duration: '4 hours',
    image: '/images/fishing.svg',
    description:
      'Troll the deep blue off Lahaina aboard a 42ft sportfisher. Tackle, licences and snacks provided — keep a share of the catch.',
    highlights: ['Captain with 20+ years experience', 'All tackle included', 'Keep your catch'],
    reviews: [
      { author: 'Derek W.', rating: 5, text: 'Landed a 30lb mahi. Crew was top notch.' },
      { author: 'Mia F.', rating: 5, text: 'Great for beginners, they did everything but reel it in for us.' },
    ],
  },
];

/** Lookup helper used by both scenes. */
export function getExperience(id: string | null | undefined): Experience | undefined {
  return EXPERIENCES.find((e) => e.id === id);
}
