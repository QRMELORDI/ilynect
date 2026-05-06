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

const getMovies = async (page = 1, searchQuery = '') => {
  try {
    const url = searchQuery 
      ? `${MOVIERULZ_DOMAIN}/?s=${encodeURIComponent(searchQuery)}`
      : `${MOVIERULZ_DOMAIN}/category/telugu-featured/page/${page}/`;
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const movies = [];

    $('.movie-list li').each((i, el) => {
      const title = $(el).find('a').attr('title');
      const link = $(el).find('a').attr('href');
      const image = $(el).find('img').attr('src');
      
      if (title && link) {
        movies.push({
          id: Buffer.from(link).toString('base64'), // Use base64 link as ID
          title,
          link,
          image,
        });
      }
    });

    return movies;
  } catch (error) {
    console.error('Scraper error (getMovies):', error.message);
    return [];
  }
};

const getDownloadLink = async (movieUrl) => {
  try {
    const { data } = await axios.get(movieUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    let easysyncrLink = null;

    // Search for Easysyncr link
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().toLowerCase();
      if (href && (href.includes('easysyncr.io') || text.includes('easysyncr'))) {
        easysyncrLink = href;
      }
    });

    return easysyncrLink;
  } catch (error) {
    console.error('Scraper error (getDownloadLink):', error.message);
    return null;
  }
};

module.exports = {
  getMovies,
  getDownloadLink,
  setDomain,
  getDomain: () => MOVIERULZ_DOMAIN
};
