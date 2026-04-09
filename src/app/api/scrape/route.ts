import { NextRequest, NextResponse } from 'next/server';
import { scrapeMultipleWebsites } from '@/lib/webscraper';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Scrape all websites
    const scrapedData = await scrapeMultipleWebsites(urls);

    // Convert Map to object for response
    const results: Record<string, any> = {};
    scrapedData.forEach((data, url) => {
      results[url] = {
        success: data.emails.length > 0 || Object.keys(data.socialLinks).length > 0,
        emails: data.emails,
        socialLinks: data.socialLinks,
        contactInfo: data.contactInfo
      };
    });

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error in scrape API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
