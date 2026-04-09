import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { searchPlaces, getPlaceDetails, GooglePlace } from '@/lib/google-places';
import { scrapeMultipleWebsites } from '@/lib/webscraper';
import { Lead } from '@/types';

// Creates an authenticated Supabase client using the user's JWT
// Required for RLS policies to recognize auth.uid()
function getAuthenticatedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { niche, location } = await request.json();

    if (!niche || !location) {
      return NextResponse.json(
        { error: 'Niche and location are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Text search to get place IDs
    const placesResponse = await searchPlaces(niche, location, apiKey);

    if (placesResponse.status === 'ZERO_RESULTS') {
      return NextResponse.json({ leads: [] });
    }

    if (placesResponse.status !== 'OK') {
      return NextResponse.json(
        { error: 'Failed to fetch business data', details: placesResponse.error_message || placesResponse.status },
        { status: 500 }
      );
    }

    // Step 2: Fetch full details for each place
    const detailsResults = await Promise.allSettled(
      placesResponse.results.map(place => getPlaceDetails(place.place_id, apiKey))
    );

    const enrichedPlaces: GooglePlace[] = detailsResults.map((result, i) => {
      if (result.status === 'fulfilled' && result.value) {
        return {
          ...placesResponse.results[i],
          ...result.value,
          place_id: placesResponse.results[i].place_id,
        };
      }
      return placesResponse.results[i];
    });

    // Step 3: Scrape websites for emails and social links
    const websiteUrls = enrichedPlaces
      .map(p => p.website)
      .filter((url): url is string => !!url);

    let scrapedDataMap = new Map<string, { emails: string[]; socialLinks: Record<string, string> }>();
    if (websiteUrls.length > 0) {
      try {
        scrapedDataMap = await scrapeMultipleWebsites(websiteUrls);
      } catch (err) {
        console.error('Web scraping failed, continuing without email data:', err);
      }
    }

    // Step 4: Assemble final leads with real scoring
    const leads: Lead[] = enrichedPlaces.map((place: GooglePlace) => {
      const scraped = place.website ? scrapedDataMap.get(place.website) : null;
      const emails = scraped?.emails ?? [];
      const socialLinks = scraped?.socialLinks ?? {};
      const businessSize = inferBusinessSize(place);
      const score = calculateLeadScore(place, emails, socialLinks, businessSize);
      const tags = generateTags(place, emails, socialLinks, score);

      return {
        id: place.place_id,
        businessName: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number || '',
        website: place.website || '',
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        emails,
        socialLinks,
        businessType: niche,
        businessSize,
        techSophistication: inferTechSophistication(place, socialLinks),
        tags,
        score,
        location: {
          city: location.split(',')[0],
          state: location.split(',')[1]?.trim(),
          country: 'USA',
        },
        createdAt: new Date(),
      };
    });

    // Step 5: Save to database using authenticated client so RLS works
    const authHeader = request.headers.get('authorization');

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const authSupabase = getAuthenticatedClient(token);

      // Verify the user from the token
      const { data: { user }, error: userError } = await authSupabase.auth.getUser();

      if (!userError && user) {
        try {
          // Insert generation record
          const { data: generation, error: genError } = await authSupabase
            .from('lead_generations')
            .insert({
              user_id: user.id,
              niche,
              location,
              leads_count: leads.length,
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (genError) {
            console.error('Error saving generation:', JSON.stringify(genError, null, 2));
          } else if (generation) {
            // Insert all leads
            const leadsToSave = leads.map(lead => ({
              user_id: user.id,
              generation_id: generation.id,
              business_name: lead.businessName,
              address: lead.address,
              phone: lead.phone,
              website: lead.website,
              emails: lead.emails,
              social_links: lead.socialLinks,
              rating: lead.rating,
              review_count: lead.reviewCount,
              business_type: lead.businessType,
              business_size: lead.businessSize,
              tech_sophistication: lead.techSophistication,
              tags: lead.tags,
              score: lead.score,
              location: lead.location,
            }));

            const { error: leadsError } = await authSupabase
              .from('saved_leads')
              .insert(leadsToSave);

            if (leadsError) {
              console.error('Error saving leads:', JSON.stringify(leadsError, null, 2));
            } else {
              console.log(`✅ Saved generation ${generation.id} with ${leadsToSave.length} leads`);
            }
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
        }
      }
    }

    return NextResponse.json({ leads });

  } catch (error) {
    console.error('Error in leads API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateLeadScore(
  place: GooglePlace,
  emails: string[],
  socialLinks: Record<string, string>,
  businessSize: 'small' | 'medium' | 'large'
): number {
  let score = 0;

  const rating = place.rating || 0;
  if (rating >= 4.5) score += 25;
  else if (rating >= 4.0) score += 20;
  else if (rating >= 3.5) score += 14;
  else if (rating >= 3.0) score += 8;
  else if (rating > 0) score += 3;

  const reviews = place.user_ratings_total || 0;
  if (reviews >= 500) score += 20;
  else if (reviews >= 200) score += 16;
  else if (reviews >= 100) score += 12;
  else if (reviews >= 50) score += 8;
  else if (reviews >= 10) score += 4;
  else if (reviews > 0) score += 1;

  if (place.website) score += 15;
  if (emails.length > 0) score += 20;
  if (place.formatted_phone_number) score += 10;

  const socialCount = Object.keys(socialLinks).length;
  if (socialCount >= 3) score += 10;
  else if (socialCount === 2) score += 7;
  else if (socialCount === 1) score += 4;

  return Math.min(100, Math.max(0, score));
}

function generateTags(
  place: GooglePlace,
  emails: string[],
  socialLinks: Record<string, string>,
  score: number
): string[] {
  const tags: string[] = [];

  if (score >= 80) tags.push('High Priority');
  else if (score >= 60) tags.push('Medium Priority');
  else tags.push('Low Priority');

  if (emails.length > 0) tags.push('Email Available');
  if (!place.website) tags.push('Needs Website');
  if ((place.rating || 0) >= 4.5) tags.push('Top Rated');
  if ((place.user_ratings_total || 0) >= 200) tags.push('High Volume');
  if (Object.keys(socialLinks).length === 0) tags.push('No Social Media');
  if (Object.keys(socialLinks).length >= 2) tags.push('Active Online');

  return tags;
}

function inferTechSophistication(
  place: GooglePlace,
  socialLinks: Record<string, string>
): 'low' | 'medium' | 'high' {
  const hasWebsite = !!place.website;
  const socialCount = Object.keys(socialLinks).length;

  if (hasWebsite && socialCount >= 2) return 'high';
  if (hasWebsite || socialCount >= 1) return 'medium';
  return 'low';
}

function inferBusinessSize(place: GooglePlace): 'small' | 'medium' | 'large' {
  const hasWebsite = !!place.website;
  const highRating = (place.rating || 0) >= 4.5;
  const manyReviews = (place.user_ratings_total || 0) >= 100;

  if (hasWebsite && highRating && manyReviews) return 'large';
  if (hasWebsite || highRating) return 'medium';
  return 'small';
}