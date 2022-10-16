const express = require('express');

// Created Require Files..
const controller = require('../controller/certificates');
const checkAuth = require('../middileware/check-user-auth');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/warranty
 * http://localhost:3000/api/warranty
 */

// TAG
router.post('/get-multiple-certificate-by-id',checkIpWhitelist, checkAdminAuth,controller.getMultipleCertificateById);
router.get('/get-all-certificate-by-admin-no-paginate',checkIpWhitelist, checkAdminAuth, controller.getAllCertificateByAdminNoPaginate);
router.put('/update-multiple-order-by-id', checkIpWhitelist,checkAdminAuth, controller.updateMultipleCertificate);

router.post('/add-single-certificate',checkIpWhitelist, checkAdminAuth, controller.addSingleCertificate);
router.get('/get-all-certificates',checkIpWhitelist, checkAdminAuth, controller.getAllCertificate);
router.post('/add-multiple-certificate',checkIpWhitelist, checkAdminAuth, controller.insertManyCertificate);
router.get('/get-certificate-by-certificate-id/:certificateId', controller.getCertificateByCertificateId);
// router.get('/get-certificate-by-certificate-refNo/:refNo', controller.getCertificateByCertificateRefNo);
router.get('/get-certificate-by-certificate-number/:certificateNumber', controller.getCertificateBycertificateNumber);
router.post('/get-certificate-data-by-customer', checkAuth, controller.getCertificateDataByCustomer);
router.post('/track-certificate-download-history', checkAuth, controller.trackCertificateDownloadHistory);
router.post('/check-certificate-data-by-customer-phone-no', checkAuth, controller.checkCertificateByCustomerPhoneNo);
router.put('/edit-certificate-by-certificate',checkIpWhitelist, checkAdminAuth, controller.editCertificateData);
router.delete('/delete-certificate-by-id/:certificateId',checkIpWhitelist, checkAdminAuth, controller.deleteCertificateByCertificateId);
router.post('/get-certificate-by-search',checkIpWhitelist, checkAdminAuth, controller.getCertificateBySearch);



// Export All router..
module.exports = router;
