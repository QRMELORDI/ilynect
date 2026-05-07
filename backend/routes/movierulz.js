const express = require('express');
const router = express.Router();
const scraper = require('../services/scraper');
const { authenticateToken } = require('../middleware/auth');

// Get movies list
router.get('/', async (req, res) => {
  try {
    const { page, s, cat } = req.query;
    const movies = await scraper.getMovies(page || 1, s || '', cat || 'telugu-featured');
    res.json({ success: true, movies });
  } catch (err) {
    console.error('MovieRulz Route Error:', err.message);
    res.status(500).json({ success: false, error: err.message, movies: [] });
  }
});

// Get specific movie details/download link
router.post('/details', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const details = await scraper.getMovieDetails(url);
    res.json({ success: true, details });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get current config
router.get('/config', async (req, res) => {
  try {
    const domain = await scraper.getDomain();
    res.json({ success: true, domain });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin only: Update domain
router.post('/config', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain required' });
    const success = await scraper.updateDomain(domain);
    res.json({ success, domain: await scraper.getDomain() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
