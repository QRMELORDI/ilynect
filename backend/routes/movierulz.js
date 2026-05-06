const express = require('express');
const router = express.Router();
const scraper = require('../services/scraper');
const { authenticateToken } = require('../middleware/auth');

// Get movies list
router.get('/', async (req, res) => {
  const { page, s, cat } = req.query;
  const movies = await scraper.getMovies(page || 1, s || '', cat || 'telugu-featured');
  res.json({ success: true, movies });
});

// Get specific movie details/download link
router.post('/details', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  
  const details = await scraper.getMovieDetails(url);
  res.json({ success: true, details });
});

// Get current config
router.get('/config', async (req, res) => {
  res.json({ success: true, domain: scraper.getDomain() });
});

// Admin only: Update domain
router.post('/config', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  const { domain } = req.body;
  scraper.setDomain(domain);
  res.json({ success: true, domain: scraper.getDomain() });
});

module.exports = router;
