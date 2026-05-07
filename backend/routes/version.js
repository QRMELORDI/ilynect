const express = require('express');
const router = express.Router();

// Current App Version - Updated to match frontend
// Change this to 1.1.3 when you release a new APK to trigger the update prompt for users.
const LATEST_VERSION = "1.2.0";
const UPDATE_URL = "https://ilynect.vercel.app"; 

router.get('/', (req, res) => {
  res.json({
    version: LATEST_VERSION,
    update_required: true,
    updateUrl: UPDATE_URL,
    message: "New update with Family Reels, Comments, and MovieRulz fixes! Tap UPDATE to get the latest features."
  });
});

module.exports = router;
