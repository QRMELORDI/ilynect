const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../db/database');

// Initial default
let MOVIERULZ_DOMAIN = 'https://www.5movierulz.camera';

// Load from DB on startup
try {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('movierulz_domain');
  if (row) MOVIERULZ_DOMAIN = row.value;
} catch (e) {
  console.error('Failed to load movierulz_domain from DB:', e.message);
}

const setDomain = (domain) => {
  if (domain) {
    MOVIERULZ_DOMAIN = domain.replace(/\/$/, '');
    try {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
        .run('movierulz_domain', MOVIERULZ_DOMAIN);
    } catch (e) {
      console.error('Failed to save movierulz_domain to DB:', e.message);
    }
  }
};

const getMovies = async (page = 1, searchQuery = '', category = 'telugu-featured') => {
  try {
    let url;
    if (searchQuery) {
      // If searching, we still want to prefer Telugu results
      url = `${MOVIERULZ_DOMAIN}/?s=${encodeURIComponent(searchQuery)}`;
    } else {
      url = `${MOVIERULZ_DOMAIN}/category/${category}/page/${page}/`;
    }
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': MOVIERULZ_DOMAIN + '/'
      }
    });

    const $ = cheerio.load(data);
    const movies = [];

    // Try multiple selectors
    let items = $('.movie-list li');
    if (items.length === 0) items = $('.content li');
    if (items.length === 0) items = $('li').has('a[href*="/movie-watch-online-free"]');

    console.log(`Scraper found ${items.length} items on ${url}`);



    items.each((i, el) => {
      const a = $(el).find('a').first();
      const title = a.attr('title') || a.text() || '';
      const link = a.attr('href');
      const image = $(el).find('img').attr('src');
      
      const lowerTitle = title.toLowerCase();
      const isTelugu = lowerTitle.includes('telugu') || 
                       category.includes('telugu') || 
                       lowerTitle.includes('(20') || 
                       lowerTitle.includes('dubbed');

      if (title && link && isTelugu) {
        // Exclude other languages explicitly
        const otherLangs = ['hindi', 'tamil', 'malayalam', 'kannada', 'english', 'multi audio'];
        const isOnlyOtherLang = otherLangs.some(lang => lowerTitle.includes(lang)) && !lowerTitle.includes('telugu');

        if (!isOnlyOtherLang) {
          movies.push({
            id: Buffer.from(link).toString('base64'),
            title: title.replace('Watch Online Free', '').trim().replace(/\s\s+/g, ' '),
            link,
            image,
          });
        }
      }
    });

    return movies;
  } catch (error) {
    console.error('Scraper error (getMovies):', error.message);
    return [];
  }
};

const getMovieDetails = async (movieUrl) => {
  try {
    const { data } = await axios.get(movieUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    let easysyncrLink = null;
    let trailerLink = null;
    const poster = $('.entry-content img').first().attr('src');
    const description = $('.entry-content p').first().text();

    // Search for Easysyncr link
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().toLowerCase();
      if (href && (href.includes('easysyncr.io') || text.includes('easysyncr'))) {
        easysyncrLink = href;
      }
      
      // Look for trailer links (YouTube)
      if (href && (href.includes('youtube.com/watch') || href.includes('youtu.be/'))) {
        trailerLink = href;
      }
    });

    // Also check iframes for trailers
    if (!trailerLink) {
      $('iframe').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('youtube.com/embed/')) {
          trailerLink = src;
        }
      });
    }

    return {
      easysyncrLink,
      trailerLink,
      poster,
      description: description.substring(0, 500) + '...' // Increased length for better description
    };
  } catch (error) {
    console.error('Scraper error (getMovieDetails):', error.message);
    return null;
  }
};

module.exports = {
  getMovies,
  getMovieDetails,
  setDomain,
  getDomain: () => MOVIERULZ_DOMAIN
};
