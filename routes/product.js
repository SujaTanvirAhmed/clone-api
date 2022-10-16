const express = require('express');

// Created Require Files..
const controller = require('../controller/product');
// const inputValidator = require('../validation/product');
const checkAuth = require('../middileware/check-user-auth');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');
// Get Express Router Function..
const router = express.Router();

/**
 * /api/product
 * http://localhost:3000/api/product
 */

router.post('/add-single-product',checkIpWhitelist,checkAdminAuth, controller.addSingleProduct);
router.post('/add-multiple-products',checkIpWhitelist,checkAdminAuth, controller.insertManyProduct);
router.post('/get-all-products', controller.getAllProducts);
router.post('/get-products-by-dynamic-sort', controller.getProductsByDynamicSort);
router.get('/get-single-product-by-slug/:slug', controller.getSingleProductBySlug);
router.get('/get-single-product-by-id/:id', controller.getSingleProductById);
router.get('/get-products-by-tag-id/:id', controller.getProductByTagId);
router.get('/get-related-products/:category/:subCategory/:id', controller.getRelatedProducts);
router.post('/get-recommended-products', controller.getRecommendedProducts);
router.post('/get-specific-products-by-ids', controller.getSpecificProductsByIds);
router.post('/get-specific-products-by-id', controller.getSpecificProductsById);

// Modify
router.put('/edit-product-by-id',checkIpWhitelist,checkAdminAuth, checkAdminAuth, controller.updateProductById);
router.post('/update-multiple-product-by-id',checkIpWhitelist,checkAdminAuth, controller.updateMultipleProductById);
router.delete('/delete-product-by-id/:id',checkIpWhitelist,checkAdminAuth, checkAdminAuth, controller.deleteProductById);
// // Filter
router.post('/product-filter-query', controller.productFilterByQuery);
// // Pagination
// router.get('/products-by-limit', controller.getProductsByLimit);
// router.get('/products-by-limit', controller.getProductsByLimit);
// // Multiple Ids
// router.post('/get-specific-products-by-id', controller.getSpecificProductsByIds);
// // Range
// router.post('/get-max-min-price', controller.getMaxMinPrice);
// router.post('/product-filter-by-menu-navigate-min-max', controller.productFilterByMinMax);
// // Search
router.post('/get-products-by-search', controller.getProductsBySearch);
router.get('/remove-all-campaign-and-discount', controller.removeAllCampaignAndDiscount);
// // Filter
// router.post('/get-product-by-filter/', controller.filterByCatSubCatBrandFilters);
// // Ultimate Query
// router.post('/get-products-by-ultimate-query', controller.ultimateQuery)


// Export All router..
module.exports = router;
