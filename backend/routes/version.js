const express = require('express');
const router = express.Router();

// Current App Version
const APP_VERSION = "1.0.3";
const UPDATE_URL = "https://your-server-url/app-release.apk"; 

router.get('/', (req, res) => {
  res.json({
    version: APP_VERSION,
    update_required: false,
    updateUrl: UPDATE_URL,
    message: "మీరు లేటెస్ట్ వెర్షన్ వాడుతున్నారు! (ILYNECT Premium)"
  });
});

router.get('/check', (req, res) => {
  res.json({
    version: APP_VERSION,
    update_required: false,
    updateUrl: UPDATE_URL,
    message: "Enjoy the latest ILYNECT updates!"
  });
});

module.exports = router;

