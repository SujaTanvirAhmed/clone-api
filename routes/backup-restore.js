const express = require('express');

// Created Require Files..
const controller = require('../controller/backup-restore');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/backup-restore
 * http://localhost:3000/api/backup-restore
 */
router.post('/collection-backup',checkIpWhitelist,checkAdminAuth, controller.backupCollection);
router.post('/collection-restore',checkIpWhitelist,checkAdminAuth, controller.restoreCollection);
router.get('/get-all-collections',checkIpWhitelist,checkAdminAuth, controller.getCollectionList);

// Export All router..
module.exports = router;
