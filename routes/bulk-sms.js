const express = require('express');

// Imports
const controller = require('../controller/bulk-sms');
const checkAuth = require('../middileware/check-user-auth');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/bulk-sms
 * http://localhost:3000/api/bulk-sms
 */

router.post('/sent-user-single-sms', checkIpWhitelist, controller.sendSmsBySslAPi);


// Export router class..
module.exports = router;
