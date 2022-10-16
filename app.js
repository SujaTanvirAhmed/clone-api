/**
 * NODEJS API
 * DATABASE MONGODB
 * VERSION 1.0.0
 * POWERED BY SOFTLAB IT
 * DEVELOP BY MD IQBAL HOSSEN
 */
const express = require("express");
const mongoose = require('mongoose');
const crossUnblocker = require('./middileware/cros-unblocker');
const path = require('path');
const dotenv = require('dotenv').config();
const schedule = require('node-schedule');

// Cross Unblocked File..
const cors = require('cors');
const errorHandler = require('./middileware/error-handler');

const utils = require('./helpers/utils')

/**
 * SCHEDULE UPDATE MODEL
 */
const Product = require('./models/product');
const  OrderTemporary= require('./models/order-temporary');


/**
 *  Router File Import
 */
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const productBrandRoutes = require('./routes/product-brand');

const productAttributeRoutes = require('./routes/product-attribute');
const productCategoryRoutes = require('./routes/product-category');
const productSubCategoryRoutes = require('./routes/product-sub-category');
const productRoutes = require('./routes/product');
const homepageListsRoutes = require('./routes/homepage-lists');
const cartRoutes = require('./routes/cart');
const offerBannerRoutes = require('./routes/offer-banner');
const promotionalBannerRoutes = require('./routes/promotional-banner');
const shopInfoRoutes = require('./routes/shop-info');
const footerDataRoutes = require('./routes/footer-data');
const newsletterRoutes = require('./routes/newsletter');

const topBrandsRoutes = require('./routes/top-brands');
const productParentCategoryRoutes = require('./routes/product-parent-category');
const galleryRoutes = require('./routes/gallery');
const imageFolderRoutes = require('./routes/image-folder');
const productTagRoutes = require('./routes/product-tag');

const customizationRoutes = require('./routes/customization');
const dealOnPlayRoutes = require('./routes/deal-on-play');
const dealsOfTheDayRoutes = require('./routes/deals-of-the-day');
const flashSaleRoutes = require('./routes/flash-sale');
const couponRoutes = require('./routes/coupon');
const storeInfoRoutes = require('./routes/store-info');
const dealerInfoRoutes = require('./routes/dealer-info');
const featuredProductRoutes = require('./routes/featured-product');
const featuredCategoryRoutes = require('./routes/featured-category');
const categoryMenuRoutes = require("./routes/category-menu");
const shippingChargeRoutes = require('./routes/shipping-charge');
const reviewControlRoutes = require("./routes/review-control");
const bannerRoutes = require("./routes/banner");
const orderRoutes = require("./routes/order");
const orderTempRoutes = require("./routes/order-temporary");
const OfferProductRoutes = require("./routes/offer-product");
const PromotionalOfferRoutes = require("./routes/promotional-offer");
const contactUsRoutes = require("./routes/contact-us");
const blogRoutes = require('./routes/blog');
const wishlistRoutes = require('./routes/wishlist');
const installationRepairRoutes = require('./routes/installation-repair');
const discussionRoutes = require('./routes/discussion');
const installationRepairTypeRoutes = require('./routes/installation-repair-type');
const AboutUsRoutes = require('./routes/about-us');
const warrantyRoutes = require('./routes/warranty');
const productAuthenticatorRoutes = require('./routes/product-authenticator');
const careerEsquireRoutes = require('./routes/career-esquire');
const promoPageRoutes = require('./routes/promo-page');
const promoBannerRoutes = require("./routes/product-promo-banner");
const faqRoutes = require('./routes/faq');
const productListBanner = require("./routes/product-list-banner");
const generalInfoRoutes = require("./routes/general-info");
const certificatesRoutes = require("./routes/certificates");
const settingRoutes = require("./routes/setting");


// Payment SSL
const paymentSSLRoutes = require("./routes/payment-ssl");
const bulkSmsRoutes = require("./routes/bulk-sms");
const backupRestoreRoutes = require("./routes/backup-restore");



/**
 * MAIN APP CONFIG
 * REPLACE BODY PARSER WITH EXPRESS PARSER
 */

const app = express();
// app.use(crossUnblocker.allowCross)
app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}))


/**
 * IMAGE UPLOAD STATIC DIR
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/**
 * MAIN BASE ROUTER WITH IMPORTED ROUTES
 */
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/top-brands', topBrandsRoutes);
app.use('/api/homepage-lists', homepageListsRoutes);
app.use('/api/product-attribute', productAttributeRoutes);
app.use('/api/product-parent-category', productParentCategoryRoutes);
app.use('/api/product-category', productCategoryRoutes);
app.use('/api/product-sub-category', productSubCategoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/offer-banner', offerBannerRoutes);
app.use('/api/promotional-banner', promotionalBannerRoutes);
app.use('/api/shop-info', shopInfoRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/image-folder', imageFolderRoutes);
app.use('/api/brand', productBrandRoutes);
app.use('/api/tag', productTagRoutes);
app.use('/api/customization', customizationRoutes);
app.use('/api/deal-on-play', dealOnPlayRoutes);
app.use('/api/deals-of-the-day', dealsOfTheDayRoutes);
app.use('/api/flash-sale', flashSaleRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/store-info', storeInfoRoutes);
app.use('/api/dealer-info', dealerInfoRoutes);
app.use('/api/featured-product', featuredProductRoutes);
app.use('/api/featured-category', featuredCategoryRoutes);
app.use('/api/category-menu', categoryMenuRoutes);
app.use('/api/shipping-charge', shippingChargeRoutes);
app.use('/api/review-control', reviewControlRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/order-temporary', orderTempRoutes);
app.use('/api/promotional-offer', PromotionalOfferRoutes);
app.use('/api/offer-product', OfferProductRoutes);
app.use('/api/payment-ssl', paymentSSLRoutes);
app.use('/api/contact-us', contactUsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/installation-and-repair', installationRepairRoutes);
app.use('/api/bulk-sms', bulkSmsRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/installation-and-repair-type', installationRepairTypeRoutes);
app.use('/api/about-us', AboutUsRoutes);
app.use('/api/warranty', warrantyRoutes);
app.use('/api/product-authenticator', productAuthenticatorRoutes);
app.use('/api/footer-data', footerDataRoutes);
app.use('/api/career-esquire', careerEsquireRoutes);
app.use('/api/promo-page', promoPageRoutes);
app.use("/api/product-promo-banner", promoBannerRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/backup-restore', backupRestoreRoutes);
app.use('/api/product-list-banner', productListBanner);
app.use('/api/general-info',generalInfoRoutes);
app.use('/api/certificates',certificatesRoutes);
app.use('/api/setting',settingRoutes);


/**
 * MAIN BASE GET PATH
 */
app.get('/', (req, res) => {
    res.send('<div style="width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center"><h1 style="color: blueviolet; text-transform: uppercase">esquireelectronicsltd RUNNING...</h1><p style="color: lightcoral">Powered by SOFTLAB IT TEAM</p></div>')
})


/**
 * Error Handler
 * 401 UnAuthorized, Access Denied
 * 406 Already Exists, Not Acceptable
 * 404 Not Found
 * 422 Input Validation Error, Unprocessable Entity
 * 500 Database Operation Error, Internal Server Error
 */
app.use(errorHandler.route);
app.use(errorHandler.next);


/**
 * NODE SCHEDULER
 */



// const expDate = new Date('2021-09-11T17:06:14+06:00');

// schedule.scheduleJob(expDate, () => {
//     console.log('NODE JOB Called in Date', new Date().toString())
// });

const sJobTwoEveryTwoHour = schedule.scheduleJob('0 */2 * * *', () => {
    console.log('NODE JOB Called in Every schedule time', new Date().toString());
    updateData().then();


    // setTimeout(() => {
    //     sJob.cancel();
    // }, 1000)
});

const sJobTwoEveryDay = schedule.scheduleJob('0 0 * * *', () => {
    console.log('NODE JOB Called in Every Day', new Date().toString());
    removeTempData().then();

});

async function updateData() {
    const today = utils.getDateString(new Date());
    const campaignProducts = await Product.find({
        $or: [
            { campaignStartDate: { $ne: null } },
            { campaignEndDate: {$ne: null} }
        ]
    });

    campaignProducts.forEach((f, i) => {
        // Time Logic
        const endDateTime = utils.convertToDateTime(f.campaignEndDate , f.campaignEndTime ? f.campaignEndTime: '23:59');
        const endTimeFromNow = utils.getDateTimeDifference(endDateTime);

        // const expDate = utils.getDateString(f.campaignEndDate);
        // const timeLeftDay = utils.getDateDifference('d', expDate, today)
        if (endTimeFromNow <= 0) {
            Product.findByIdAndUpdate(f._id, {
                $set: {
                    discountType: null,
                    discountAmount: 0,
                    campaignStartDate: null,
                    campaignStartTime: null,
                    campaignEndDate: null,
                    campaignEndTime: null
                }
            }).exec();
        } else {
            // console.log('Time Not Expired')
        }
    })
}

async function removeTempData() {
    const today = new Date();
    today.setDate(today.getDate() - 2);
    const todayStr = utils.getDateString(today);
    await OrderTemporary.deleteMany({
        createdAt: {$lt: todayStr}
    });
}

/**
 * NODEJS SERVER
 * PORT CONTROL
 * MongoDB Connection
 * IF PASSWORD contains @ then encode with https://meyerweb.com/eric/tools/dencoder/
 * Database Name roc-ecommerce
 * User Access authSource roc-ecommerce
 */
mongoose.connect(
    //  `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017/${process.env.DB_NAME}?authSource=${process.env.AUTH_SOURCE}`,
    `mongodb://localhost:27017/${process.env.DB_NAME}`,
    {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
)
    .then(() => {
        const port = process.env.PORT || 3000;
        app.listen(port, () => console.log(`Server is running at port:${port}`));
        console.log('Connected to mongoDB');

    })
    .catch(err => {
        console.error('Oops! Could not connect to mongoDB Cluster0', err);
    })
