const {validationResult} = require('express-validator');

// Require Post Schema from Model..
const FeaturedCategory = require('../models/featured-category');

/**
 * Add Gallery
 * Get Gallery List
 */

exports.addNewFeaturedCategory = async (req, res, next) => {
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
        const dataSchema = new FeaturedCategory(data);
        await dataSchema.save();

        res.status(200).json({
            message: 'Featured Category Added Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getAllFeaturedCategory = async (req, res, next) => {
    try {

        let pageSize = req.query.pageSize;
        let currentPage = req.query.page;

        let queryData;
        queryData = FeaturedCategory.find()

        




        if (pageSize && currentPage) {
            queryData.skip(Number(pageSize) * (Number(currentPage) - 1)).limit(Number(pageSize))
        }

        // const data = await queryData.populate('products').sort({priority: -1});
        const data = await queryData
        .populate(
            {
                path: 'products', 
                select: '_id productName productSlug sku images price discountType discountAmount quantity productVisibility category brandSlug categorySlug',
                match: { productVisibility: true }
            }
        )
        .sort({priority: -1})

        const dataCount = await FeaturedCategory.countDocuments();


        res.status(200).json({
            data: data,
            count: dataCount,
            message: 'Featured Category fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSingleFeaturedCategoryById = async (req, res, next) => {
    const id = req.params.id;
    const query = {_id: id};
    const select = req.query.select;


    try {
        const data = await FeaturedCategory.findOne(query)
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


exports.deleteFeaturedCategoryById = async (req, res, next) => {
    const id = req.params.id;
    const query = {_id: id}

    try {
        await FeaturedCategory.deleteOne(query);

        res.status(200).json({
            message: 'Featured Category delete Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editFeaturedCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    try {
        const updatedData = req.body;
        const query = {_id: updatedData._id}
        const push = {$set: updatedData}

        await FeaturedCategory.findOneAndUpdate(query, push)

        res.status(200).json({
            message: 'Featured Category delete Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}


