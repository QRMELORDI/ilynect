const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../db/database');

let MOVIERULZ_DOMAIN = 'https://www.5movierulz.camera';

const MIRRORS = [
  'https://www.7movierulz.tc',
  'https://www.6movierulz.pw',
  'https://www.movierulz.com.ru',
  'https://ww1.5movierulz.camera'
];

async function getDomain() {
  try {
    const row = db.getAsync('SELECT value FROM settings WHERE key = ?', ['movierulz_domain']);
    if (row && row.value) {
      return row.value;
    }
  } catch (e) {}
  return MOVIERULZ_DOMAIN;
}

async function updateDomain(newDomain) {
  if (!newDomain.startsWith('http')) newDomain = 'https://' + newDomain;
  MOVIERULZ_DOMAIN = newDomain;
  try {
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['movierulz_domain', newDomain]);
    return true;
  } catch (e) {
    return false;
  }
}

async function getMovies(page = 1, search = '', category = 'telugu-featured') {
  let domains = [await getDomain(), ...MIRRORS];
  domains = [...new Set(domains)];

  let lastError = null;
  for (const domain of domains) {
    try {
      let url = `${domain}/page/${page}/`;
      if (search) {
        url = `${domain}/search_movies?s=${encodeURIComponent(search)}`;
      } else if (category === 'telugu-dubbed') {
        url = `${domain}/category/telugu-dubbed/page/${page}/`;
      } else if (category === 'telugu-featured') {
        url = `${domain}/category/telugu-featured/page/${page}/`;
      }

      console.log(`Scraping MovieRulz (${domain}): ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Referer': domain + '/',
          'Sec-Fetch-Site': 'same-origin'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const movies = [];

      $('.boxed.film').each((i, el) => {
        const linkEl = $(el).find('a').first();
        const imgEl = $(el).find('img').first();
        let title = linkEl.attr('title') || $(el).find('p').text() || 'Unknown Movie';
        let link = linkEl.attr('href');
        let image = imgEl.attr('src');

        if (link && title) {
          title = title.replace('Watch ', '').replace(' Full Movie Online Free', '').replace(/[\n\r]/g, ' ').trim();
          if (!link.startsWith('http')) link = domain + (link.startsWith('/') ? '' : '/') + link;
          
          movies.push({
            id: Buffer.from(link).toString('base64').substring(0, 16),
            title: title,
            link: link.trim(),
            image: image || 'https://via.placeholder.com/200x300?text=No+Poster'
          });
        }
      });

      if (movies.length === 0 && response.data.includes('Just a moment...')) {
         continue; // Try next mirror
      }

      if (movies.length > 0) {
        return { success: true, movies };
      }
    } catch (err) {
      console.error(`Scraper Error on ${domain}:`, err.message);
      lastError = err.message;
    }
  }

  return { success: false, movies: [], error: lastError || 'All mirrors failed or returned no results.' };
}

async function getMovieDetails(movieUrl) {
  try {
    const domain = await getDomain();
    console.log(`Scraping Details: ${movieUrl}`);
    
    const response = await axios.get(movieUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': domain + '/'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    let easysyncrLink = null;
    let trailerLink = null;
    let magnetLinks = [];

    $('a').each((i, el) => {
      let href = $(el).attr('href');
      if (href) {
        href = href.trim();
        
        // Match easysyncr.io
        if (href.includes('easysyncr.io') || href.includes('vjs-download')) {
          if (href.startsWith('//')) href = 'https:' + href;
          else if (!href.startsWith('http') && !href.startsWith('magnet:')) href = 'https://' + href;
          easysyncrLink = href.replace(/\s/g, '');
        } 
        
        // Match magnet links
        if (href.startsWith('magnet:?xt=urn:btih:')) {
          magnetLinks.push({
            title: $(el).text() || 'Torrent',
            url: href
          });
        }

        // Match youtube
        if (href.includes('youtube.com/watch') || href.includes('youtu.be')) {
          trailerLink = href.trim();
        }
      }
    });

    // Fallback: search raw body for easysyncr or magnet patterns
    if (!easysyncrLink) {
       const bodyText = response.data;
       const match = bodyText.match(/https?:\/\/(www\.)?easysyncr\.io\/[a-zA-Z0-9]+/);
       if (match) easysyncrLink = match[0].trim();
       
       const magnetMatch = bodyText.match(/magnet:\?xt=urn:btih:[a-zA-Z0-9]+/g);
       if (magnetMatch && magnetLinks.length === 0) {
         magnetLinks = magnetMatch.map(m => ({ title: 'Magnet Link', url: m }));
       }
    }

    const details = {
      description: $('.entry-content p').first().text() || 'No description available.',
      poster: $('.entry-content img').first().attr('src'),
      easysyncrLink,
      magnetLinks,
      trailerLink
    };

    return { success: true, details };
  } catch (err) {
    console.error('Scraper Error (Details):', err.message);
    return { success: false, details: null, error: err.message };
  }
}

module.exports = { getMovies, getMovieDetails, updateDomain, getDomain };
