const express = require('express');

// Imports
const controller = require('../controller/product-list-banner');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/product-list-banner
 * http://localhost:3000/api/product-list-banner
 */

router.post('/add-new-product-list-banner',checkIpWhitelist,checkAdminAuth, controller.addProductListBanner);
router.post('/add-new-product-list-banner-multi',checkIpWhitelist,checkAdminAuth, controller.addNewProductListBannerMulti);
router.get('/get-all-product-list-banner-list', controller.getAllProducListBanner);
router.get('/get-product-list-banner-details-by-id/:id', controller.getSingleProductBannerById);
router.get('/get-product-list-banner-details-by-slug/:slug', controller.getSingleProductBannerBySlug);
router.delete('/delete-product-list-banner-by-id/:id',checkIpWhitelist,checkAdminAuth, controller.deleteProductBannerById);
router.post('/delete-product-list-banner-multi',checkIpWhitelist,checkAdminAuth, controller.deleteProductBannerMulti);
router.put('/edit-product-list-banner-by-id',checkIpWhitelist,checkAdminAuth, controller.editProductListBannerData);


// Export router class..
module.exports = router;
