const scraper = require('./backend/services/scraper');

async function testScraper() {
  console.log('Testing scraper with default domain:', scraper.getDomain());
  try {
    const movies = await scraper.getMovies(1);
    console.log(`Found ${movies.length} movies.`);
    if (movies.length > 0) {
      console.log('First movie:', movies[0].title);
      console.log('URL:', movies[0].link);
      
      console.log('Testing details for first movie...');
      const details = await scraper.getMovieDetails(movies[0].link);
      console.log('Details:', details);
    }
  } catch (error) {
    console.error('Scraper test failed:', error);
  }
}

testScraper();
