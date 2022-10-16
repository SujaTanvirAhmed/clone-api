const {validationResult} = require('express-validator');

// Require Post Schema from Model..
const OfferProduct = require('../models/offer-product');
const utils = require('../helpers/utils')

/**
 *  Offer Product
 */

exports.addNewOfferProduct = async (req, res, next) => {
    // console.log(req.body)
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }
    try {

        const data = req.body;
        const dataSchema = new OfferProduct(data);
        await dataSchema.save();

        res.status(200).json({
            message: 'Offer Product Added Successfully!'
        });
    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getAllOfferProduct = async (req, res, next) => {
    try {

        let pageSize = req.query.pageSize;
        let currentPage = req.query.page;

        let queryData;
        queryData = OfferProduct.find().select('name promotionalOfferSlug products createdAt');

        if (pageSize && currentPage) {
            queryData.skip(Number(pageSize) * (Number(currentPage) - 1)).limit(Number(pageSize))
        }

        const data = await queryData.populate('products', 'productName productSlug sku images price discountType discountAmount quantity categorySlug').sort({createdAt: -1});
        const dataCount = await OfferProduct.countDocuments();

        res.status(200).json({
            data: data,
            count: dataCount,
            message: 'Offer Product fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSingleOfferProductById = async (req, res, next) => {
    const id = req.params.id;
    const query = {_id: id};
    const select = req.query.select;


    try {
        const data = await OfferProduct.findOne(query)
            .populate('products', select ? select : '');
        res.status(200).json({
            data: data
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getOfferProductBySlug = async (req, res, next) => {
    const productSlug = req.params.slug;
    try {
        const query = {promotionalOfferSlug: productSlug};
        const data = await OfferProduct.find(query)
        .populate(
            {
                path: 'products',
                model: 'Product',
                select: '-sku -attributes -filterData -tags -discussion -warrantyServices -shortDescription -description -stockVisibility -productVisibility -deliveryPolicy -paymentPolicy -warrantyPolicy',
                match: {productVisibility: true}
            }
        );


        // Check Campaign
        if (data && data.length) {
            data.forEach(campaign => {
                if (campaign && campaign.products && campaign.products.length) {
                    campaign.products.forEach(m => {
                        // Check Discount with Campaign
                        if (m.campaignStartDate && m.campaignEndDate) {

                            const startDateTime = utils.convertToDateTime(m.campaignStartDate, m.campaignStartTime);
                            const endDateTime = utils.convertToDateTime(m.campaignEndDate, m.campaignEndTime);

                            const startTimeFromNow = utils.getDateTimeDifference(startDateTime);
                            const endTimeFromNow = utils.getDateTimeDifference(endDateTime);

                            // startTimeFromNow > 0 ---> Not Start Yet ** Discount will be 0 **
                            // startTimeFromNow < 0 ---> Already Started ** Discount will live **
                            // endTimeFromNow > 0 ---> Running ** Discount will live **
                            // endTimeFromNow < 0 ---> Expired ** Discount will be 0 **


                            if (startTimeFromNow > 0 || endTimeFromNow <= 0) {
                                m.discountType = null;
                                m.discountAmount = 0;
                            }

                        }
                    })
                }

            })
        }
            
        //     console.log(data);
        res.status(200).json({
            data: data,
            message: 'Offer products fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.deleteOfferProductById = async (req, res, next) => {
    const id = req.params.id;
    const query = {_id: id}

    try {
        await OfferProduct.deleteOne(query);

        res.status(200).json({
            message: 'Offer Product delete Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editOfferProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const updatedData = req.body;
    // console.log(updatedData);
    const query = {_id: updatedData._id}
    const push = {$set: updatedData}

    OfferProduct.findOneAndUpdate(query, push)
        .then(() => {
            res.status(200).json({
                message: 'Offer Product Updated Successfully!'
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

}


