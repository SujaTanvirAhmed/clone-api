const { validationResult } = require('express-validator');

// Require Post Schema from Model..
const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/product');
const utils = require("../helpers/utils");


exports.addToCart = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const userId = req.userData.userId;
    const data = req.body;
    const final = { ...data, ...{ user: userId } }

    try {
        const cart = new Cart(final);
        const cartRes = await cart.save();

        await User.findOneAndUpdate({ _id: userId }, {
            "$push": {
                carts: cartRes._id
            }
        })
        res.status(200).json({
            message: 'Added to Cart Successfully!'
        });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getCartItemByUserId = async (req, res, next) => {

    const userId = req.userData.userId;

    try {

        const data = await User.findOne({ _id: userId })
            .populate({
                path: 'carts -_id',
                populate: {
                    path: 'product',
                    select: 'productName productSlug categorySlug price discountType discountAmount  quantity images campaignStartDate campaignStartTime campaignEndDate campaignEndTime'
                }
            }).select('carts')


        // Discount Check with Campaign
        if (data && data.carts && data.carts.length) {
            data.carts.forEach(m => {
                if (m.product.campaignStartDate && m.product.campaignEndDate) {
                    const startDateTime = utils.convertToDateTime(m.product.campaignStartDate, m.product.campaignStartTime);
                    const endDateTime = utils.convertToDateTime(m.product.campaignEndDate, m.product.campaignEndTime);

                    const startTimeFromNow = utils.getDateTimeDifference(startDateTime);
                    const endTimeFromNow = utils.getDateTimeDifference(endDateTime);

                    // startTimeFromNow > 0 ---> Not Start Yet ** Discount will be 0 **
                    // startTimeFromNow < 0 ---> Already Started ** Discount will live **
                    // endTimeFromNow > 0 ---> Running ** Discount will live **
                    // endTimeFromNow < 0 ---> Expired ** Discount will be 0 **

                    if (startTimeFromNow > 0 || endTimeFromNow <= 0) {
                        m.product.discountType = null;
                        m.product.discountAmount = 0;
                    }
                }

                // console.log(m)
            })
        }

        res.status(200).json({
            data: data && data.carts ? data.carts : [],
            message: 'All Products Fetched Successfully!'
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

exports.incrementCartQty = async (req, res, next) => {

    const cartId = req.body.cartId;

    try {
        await Cart.findOneAndUpdate(
            { _id: cartId },
            { $inc: { 'selectedQty': 1 } },
            { new: true }
        )
        res.status(200).json({
            message: 'Update cart quantity Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.decrementCartQty = async (req, res, next) => {

    const cartId = req.body.cartId;

    try {
        await Cart.findOneAndUpdate(
            { _id: cartId },
            { $inc: { 'selectedQty': -1 } },
            { new: true }
        )
        res.status(200).json({
            message: 'Update cart quantity Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.deleteCartItem = async (req, res, next) => {

    const cartId = req.params.cartId;
    const userId = req.userData.userId;

    try {
        const query = { _id: cartId }
        await Cart.deleteOne(query)

        await User.updateOne(
            { _id: userId },
            {
                $pull: { carts: { "$in": cartId } }
            }
        )

        res.status(200).json({
            message: 'Item Removed Successfully From Cart!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}

exports.getCartItemCount = async (req, res, next) => {

    const userId = req.userData.userId;

    try {

        const cartsId = await User.findOne({ _id: userId }).distinct('carts')

        res.status(200).json({
            data: cartsId.length
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSingleCartProduct = async (req, res, next) => {
    const userId = req.userData.userId;
    const productId = req.params.productId;

    try {

        const data = await Cart.findOne({ user: userId, product: productId }).select('selectedQty')

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
