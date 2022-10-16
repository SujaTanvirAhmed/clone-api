/** @format */

// Main Module Required..
const express = require("express");

// Created Require Files..
const controller = require("../controller/product-promo-banner");
const checkAdminAuth = require("../middileware/check-admin-auth");
const checkIpWhitelist = require("../middileware/check-ip-whitelist");
const router = express.Router();

/**
 * /promo-banner
 * http://localhost:3000/api/product-promo-banner
 */

router.post(
  "/add-promo-banner-info",
  checkIpWhitelist,
  checkAdminAuth,
  controller.addPromoBanner
);
router.get("/get-all-promo-banner-info", controller.getPromoBanner);
router.get(
  "/get-promo-banner-by-id/:promoBannerId",
  controller.getPromoBannerbyId
);
router.put(
  "/edit-promo-banner",
  checkIpWhitelist,
  checkAdminAuth,
  controller.editPromoBannerInfo
);
router.put(
  "/update-promo-banner-info",
  checkIpWhitelist,
  checkAdminAuth,
  controller.updatePromoBannerInfo
);
router.delete(
  "/delete-promo-banner-by-id/:id",
  checkIpWhitelist,
  checkAdminAuth,
  controller.deletePromoBanner
);

// Export All router..
module.exports = router;
