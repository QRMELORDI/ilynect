const express = require('express');
const router = express.Router();

// Current App Version - Updated to match frontend
const APP_VERSION = "1.0.5";
const UPDATE_URL = "https://ilynect.vercel.app"; 

router.get('/', (req, res) => {
  res.json({
    version: APP_VERSION,
    update_required: false,
    updateUrl: UPDATE_URL,
    message: "మీరు లేటెస్ట్ వెర్షన్ లో ఉన్నారు! (ILYNECT Premium)"
  });
});

module.exports = router;

