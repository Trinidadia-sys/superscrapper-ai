import * as cheerio from 'cheerio';

export interface ScrapedData {
  emails: string[];
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  contactInfo?: {
    phone?: string;
    address?: string;
  };
}

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;

const EMAIL_BLOCKLIST = [
  'example.com', 'test.com', 'sample.com', 'sentry.io',
  'noreply', 'no-reply', 'privacy', 'unsubscribe',
  'wixpress.com', 'squarespace.com', 'wordpress.com',
  'domain.com',
];

// Rotate through user agents to reduce blocking
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function filterEmails(emails: string[]): string[] {
  return [...new Set(
    emails.filter(email => {
      const lower = email.toLowerCase();
      return !EMAIL_BLOCKLIST.some(blocked => lower.includes(blocked));
    })
  )].slice(0, 5);
}

function extractFromHtml(html: string): ScrapedData {
  const $ = cheerio.load(html);
  const result: ScrapedData = { emails: [], socialLinks: {}, contactInfo: {} };

  // 1. Extract emails from full HTML text
  const rawEmails = html.match(EMAIL_REGEX) || [];
  result.emails = filterEmails(rawEmails);

  // 2. Extract emails from mailto: links (often cleaner)
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const email = href.replace('mailto:', '').split('?')[0].trim();
    if (email && !result.emails.includes(email)) {
      result.emails.push(email);
    }
  });
  result.emails = filterEmails(result.emails);

  // 3. Extract phone from tel: links first (most reliable)
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const phone = href.replace('tel:', '').trim();
    if (phone && !result.contactInfo?.phone) {
      result.contactInfo!.phone = phone;
    }
  });

  // 4. Extract phone from itemprop / schema markup
  if (!result.contactInfo?.phone) {
    const phoneEl = $('[itemprop="telephone"]').first();
    if (phoneEl.length) {
      result.contactInfo!.phone = phoneEl.attr('content') || phoneEl.text().trim();
    }
  }

  // 5. Extract phone from visible text if still missing
  if (!result.contactInfo?.phone) {
    const bodyText = $('body').text();
    const phoneMatch = bodyText.match(PHONE_REGEX);
    if (phoneMatch) {
      result.contactInfo!.phone = phoneMatch[0];
    }
  }

  // 6. Social media links
  const socialMap: Record<string, keyof ScrapedData['socialLinks']> = {
    'facebook.com': 'facebook',
    'fb.com': 'facebook',
    'twitter.com': 'twitter',
    'x.com': 'twitter',
    'linkedin.com': 'linkedin',
    'instagram.com': 'instagram',
  };

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    for (const [domain, platform] of Object.entries(socialMap)) {
      if (href.includes(domain) && !result.socialLinks[platform]) {
        result.socialLinks[platform] = href;
      }
    }
  });

  // 7. JSON-LD structured data
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item.email && !result.emails.includes(item.email)) {
          result.emails.push(item.email);
        }
        if (item.telephone && !result.contactInfo?.phone) {
          result.contactInfo!.phone = item.telephone;
        }
      }
    } catch {
      // Ignore malformed JSON-LD
    }
  });

  result.emails = filterEmails(result.emails);
  return result;
}

async function fetchScrape(url: string): Promise<ScrapedData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // increased to 10s

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': randomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`[Scraper] ${url} → HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();
    const result = extractFromHtml(html);
    console.log(`[Scraper] ${url} → emails: ${result.emails.length}, phone: ${result.contactInfo?.phone ?? 'none'}`);
    return result;

  } catch (err: any) {
    // AbortError = timeout, others = blocked/network error
    const reason = err?.name === 'AbortError' ? 'timeout' : err?.message ?? 'unknown';
    console.log(`[Scraper] ${url} → failed (${reason})`);
    return null;
  }
}

async function fetchContactPage(baseUrl: string): Promise<ScrapedData | null> {
  try {
    const url = new URL(baseUrl);
    // Try common contact page paths
    const contactPaths = ['/contact', '/contact-us', '/about', '/about-us'];
    for (const path of contactPaths) {
      const result = await fetchScrape(`${url.origin}${path}`);
      if (result && (result.emails.length > 0 || result.contactInfo?.phone)) {
        return result; // Return first path that yields data
      }
    }
    return null;
  } catch {
    return null;
  }
}

function mergeScrapedData(a: ScrapedData, b: ScrapedData | null): ScrapedData {
  if (!b) return a;
  return {
    emails: filterEmails([...a.emails, ...b.emails]),
    socialLinks: { ...a.socialLinks, ...b.socialLinks },
    contactInfo: {
      phone: a.contactInfo?.phone || b.contactInfo?.phone,
      address: a.contactInfo?.address || b.contactInfo?.address,
    },
  };
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  if (!url) return { emails: [], socialLinks: {} };

  // Scrape homepage and contact page in parallel
  const [homeData, contactData] = await Promise.all([
    fetchScrape(url),
    fetchContactPage(url),
  ]);

  return mergeScrapedData(
    homeData || { emails: [], socialLinks: {}, contactInfo: {} },
    contactData
  );
}

export async function scrapeMultipleWebsites(
  urls: string[]
): Promise<Map<string, ScrapedData>> {
  const results = new Map<string, ScrapedData>();

  const BATCH_SIZE = 8;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async url => {
        try {
          const data = await scrapeWebsite(url);
          results.set(url, data);
        } catch (err) {
          console.error(`[Scraper] Unexpected error for ${url}:`, err);
          results.set(url, { emails: [], socialLinks: {}, contactInfo: {} });
        }
      })
    );

    // Short delay between batches
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return results;
}