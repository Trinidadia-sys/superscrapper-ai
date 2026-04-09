export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface GooglePlacesResponse {
  results: GooglePlace[];
  status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED';
  error_message?: string;
}

// Normalizes user-entered or quick-select niches into search terms
// that reliably return results from the Google Places Text Search API
const NICHE_KEYWORD_MAP: Record<string, string> = {
  // Quick-select niches
  'restaurants': 'restaurants',
  'dentists': 'dental office',
  'real estate agents': 'real estate agency',
  'lawyers': 'law firm',
  'gyms': 'gym fitness center',
  'salons': 'hair salon beauty salon',
  'contractors': 'general contractor construction company',
  'consultants': 'consulting firm business consultant',

  // Common freeform variants
  'dentist': 'dental office',
  'lawyer': 'law firm',
  'attorney': 'law firm',
  'attorneys': 'law firm',
  'gym': 'gym fitness center',
  'fitness': 'gym fitness center',
  'salon': 'hair salon beauty salon',
  'barber': 'barber shop',
  'barbers': 'barber shop',
  'contractor': 'general contractor construction company',
  'consultant': 'consulting firm business consultant',
  'real estate': 'real estate agency',
  'realtor': 'real estate agency',
  'realtors': 'real estate agency',
  'plumber': 'plumbing company',
  'plumbers': 'plumbing company',
  'electrician': 'electrician electrical contractor',
  'electricians': 'electrician electrical contractor',
  'accountant': 'accounting firm CPA',
  'accountants': 'accounting firm CPA',
  'chiropractor': 'chiropractic clinic',
  'chiropractors': 'chiropractic clinic',
  'photographer': 'photography studio',
  'photographers': 'photography studio',
  'landscaper': 'landscaping company',
  'landscapers': 'landscaping company',
  'cleaning': 'cleaning service company',
  'cleaning service': 'cleaning service company',
  'pest control': 'pest control company',
  'insurance': 'insurance agency',
  'mortgage': 'mortgage broker',
  'financial advisor': 'financial advisory firm',
  'financial advisors': 'financial advisory firm',
  'mechanic': 'auto repair shop',
  'mechanics': 'auto repair shop',
  'auto repair': 'auto repair shop',
  'veterinarian': 'veterinary clinic animal hospital',
  'vet': 'veterinary clinic animal hospital',
  'vets': 'veterinary clinic animal hospital',
  'optometrist': 'optometry eye care clinic',
  'optometrists': 'optometry eye care clinic',
  'therapist': 'therapy counseling center',
  'therapists': 'therapy counseling center',
  'tutors': 'tutoring center education',
  'tutor': 'tutoring center education',
  'daycare': 'daycare child care center',
  'hotel': 'hotel',
  'hotels': 'hotel',
  'spa': 'day spa massage',
  'spas': 'day spa massage',
  'marketing agency': 'marketing agency',
  'web design': 'web design agency',
  'it services': 'IT services company',
};

export function normalizeNiche(niche: string): string {
  const lower = niche.trim().toLowerCase();
  return NICHE_KEYWORD_MAP[lower] || niche.trim();
}

export async function searchPlaces(
  query: string,
  location?: string,
  apiKey?: string
): Promise<GooglePlacesResponse> {
  if (!apiKey) {
    throw new Error('Google Places API key is required');
  }

  const normalizedQuery = normalizeNiche(query);
  const searchQuery = location ? `${normalizedQuery} in ${location}` : normalizedQuery;

  try {
    const textSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    textSearchUrl.searchParams.append('query', searchQuery);
    textSearchUrl.searchParams.append('key', apiKey);

    const response = await fetch(textSearchUrl.toString());
    const data = await response.json();

    console.log(`Places API [${searchQuery}] → status: ${data.status}, results: ${data.results?.length ?? 0}`);

    if (data.status === 'ZERO_RESULTS') {
      return { results: [], status: 'ZERO_RESULTS' };
    }

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data);
      return {
        results: [],
        status: data.status,
        error_message: data.error_message,
      };
    }

    return {
      results: data.results.slice(0, 20),
      status: 'OK',
    };

  } catch (error) {
    console.error('Error calling Google Places API:', error);
    return {
      results: [],
      status: 'INVALID_REQUEST',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<GooglePlace | null> {
  try {
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.append('place_id', placeId);
    detailsUrl.searchParams.append('key', apiKey);
    detailsUrl.searchParams.append('fields', 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,geometry');

    const response = await fetch(detailsUrl.toString());
    const data = await response.json();

    if (data.status === 'OK') {
      return data.result;
    }

    return null;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}