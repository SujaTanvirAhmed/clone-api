// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/coupon');
const checkAuth = require('../middileware/check-user-auth');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');


const router = express.Router();

/**
 * /api/coupon
 * http://localhost:3000/api/coupon
 */


router.post('/add-coupon', checkIpWhitelist, checkAdminAuth, controller.addCoupon);
router.get('/get-all-coupons', checkIpWhitelist, checkAdminAuth, controller.getAllCoupons);
router.get('/get-coupon-by-coupon-id/:couponId', checkIpWhitelist, checkAdminAuth, controller.getCouponCouponId);

router.get('/check-coupon-for-user-apply/:couponCode', checkAuth, controller.checkCouponForApply);

router.get('/use-coupon/:couponCode', checkAuth, controller.useCoupon);


// use this API to edit coupons using coupon id, all fields of a coupon needs to be resent
// format of body data is the same as adding coupon
router.put('/edit-coupon', checkIpWhitelist, checkAdminAuth, controller.editCouponData); // http://localhost:3000/api/coupon/edit-coupon/:couponId


// use this API to delete coupons with coupon id
router.delete('/delete-coupon-by-id/:couponId', checkIpWhitelist, checkAdminAuth, controller.deleteCoupon); // http://localhost:3000/api/coupon/delete-coupon/:couponId




// use this API to get the value of couponId and couponValue during order calculations to adjust price
// {
//     "Id": "6053da7f70ea542dcce747c8",
//     "couponValue": 15,
//     "message": "Coupon Added Successfully To Order!"
// }
// returns data as the structure above if coupon can be used, otherwise returns values of 0 for both couponId and couponValue if coupon has been used or does not exist



// use this API only once the order has been confirmed and placed to add coupon useage information to both user and coupon collection with the couponCode like "PREORDER!%"
router.put('/coupon-used', checkAuth, controller.couponUsed); // http://localhost:3000/api/coupon/coupon-used/:couponCode


// Export router class..
module.exports = router;
