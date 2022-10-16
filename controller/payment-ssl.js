const SslCommerzPayment = require("sslcommerz");

const Order = require('../models/order');
const OrderTemp = require('../models/order-temporary');
const OrderPaymentInfo = require('../models/order-payment-info');
const User = require('../models/user');
const Cart = require('../models/cart');
const mongoose = require('mongoose');
const ax = require("axios");
const enumObj = require("../helpers/enum-obj");
const Product = require("../models/product");
const Coupon = require('../models/coupon');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Add To ORDER
 * GET ORDER LIST
 */

exports.init = async (req, res, next) => {

    const data = req.body;

    // console.log('here init');

    try {

        let credential = new SslCommerzPayment(
            process.env.STORE_ID,
            process.env.STORE_PASSWORD,
            true
        );

        data.store_id = process.env.STORE_ID;
        data.store_passwd = process.env.STORE_PASSWORD

        const response = credential.init(data);

        response.then(function (result) {
            // console.log(result)
            res.status(200).json({
                data: result,
                message: 'Data received successfully!'
            });
        })

    } catch (err) {
        // console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.validate = async (req, res, next) => {

    try {

        let test = new SslCommerzPayment(
            process.env.STORE_ID,
            process.env.STORE_PASSWORD
        );

        const data = req.body.data;
        // console.log(req.body);

        const response = test.validate(data);

        // console.log('here validate');

        response.then(function (result) {
            // console.log(result)
            res.status(200).json({
                data: result,
                message: 'Data received successfully!'
            });
        })

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.transactionQueryBySessionId = async (req, res, next) => {

    try {

        let test = new SslCommerzPayment(
            process.env.STORE_ID,
            process.env.STORE_PASSWORD
        );

        const data = req.body.data;
        // console.log(req.body);

        const response = test.transactionQueryBySessionId(data);

        // console.log('here transactionQueryBySessionId');

        response.then(function (result) {
            // console.log(result)
            res.status(200).json({
                data: result,
                message: 'Data received successfully!'
            });
        })

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.transactionQueryByTransactionId = async (req, res, next) => {

    try {

        let test = new SslCommerzPayment(
            process.env.STORE_ID,
            process.env.STORE_PASSWORD
        );

        const data = req.body.data;
        // console.log(req.body);

        const response = test.transactionQueryByTransactionId(data);

        // console.log('here transactionQueryByTransactionId');

        response.then(function (result) {
            // console.log(result)
            res.status(200).json({
                data: result,
                message: 'Data received successfully!'
            });
        })

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

// FROM SSL

exports.ipn = async (req, res, next) => {

    try {

        let message = '';
        const data = await req.body;

        const status = data.status;
        const tranId = data.tran_id;
        const total_amount = data.amount;

        let tempOrder = await OrderTemp.findOne({orderId: tranId});
        const tempOrderData = tempOrder._doc;

        if (status === 'VALID') {
            
            const finalOrderData = {...tempOrderData, ...{paymentMethod: data.card_type, paymentStatus: 'paid'}}
            delete finalOrderData._id;
            // delete finalOrderData.smsTemp;
            
            
            const orderPaymentInfo = new OrderPaymentInfo(data);
            const saveOrderPayInfo = await orderPaymentInfo.save();
            
            const order = new Order(finalOrderData);
            const orderSave = await order.save();

            // SMS

            const smsData = {
                user: process.env.SMSUSER,
                pass: process.env.SMSPASS,
                msisdn: '88' + tempOrderData.phoneNo,
                sms: `Dear ${tempOrderData.name}, Your order ${tranId} has been placed. We will update you once the order is confirmed. Thank you for shopping at http://www.esquireelectronicsltd.com.`,
                sid: process.env.SMSSID,
                csmsid: tempOrderData.phoneNo
            }

            await Order.findOneAndUpdate(
                {_id: orderSave._id},
                {$set: {orderPaymentInfo: saveOrderPayInfo._id}}
            )

            await OrderTemp.deleteOne({orderId: tranId});

            // UPDATE USER CARTS & CHECKOUT
            await User.findOneAndUpdate(
                {_id: finalOrderData.user},
                {$set: {carts: [], checkouts: orderSave._id}}
            )

            await Cart.deleteMany(
                {user: mongoose.Types.ObjectId(finalOrderData.user)}
            )

            if (finalOrderData && finalOrderData.couponId) {
                await Coupon.findByIdAndUpdate({_id: finalOrderData.couponId}, {$push: {couponUsedByUser: finalOrderData.user}});
                await User.findByIdAndUpdate({_id: finalOrderData.user}, {$push: {usedCoupons: finalOrderData.couponId}})
            }

            // Update Quantity

            const orderDB = await Order.findOne({_id: orderSave._id})
                .populate(
                    {
                        path: 'orderedItems.product',
                        model: 'Product',
                        select: 'soldQuantity quantity'
                    }
                );

            if (orderDB && orderDB.orderedItems.length) {
                const mOrderProducts = orderDB.orderedItems.map(m => {
                    return {
                        _id: m.product._id,
                        soldQuantity: m.quantity,
                        productSoldQty: m.product.soldQuantity,
                        productQty: m.product.quantity,
                    }
                });
                mOrderProducts.forEach(m => {
                    // Create Complex Query
                    const q1 = incrementSoldQuantityQuery(m);
                    let finalQuery;
                    if (q1.$inc) {
                        // console.log('i am if')
                        finalQuery = {$inc: {soldQuantity: q1.$inc.soldQuantity}}
                    } else {
                        // console.log('i am else');
                
                        finalQuery = {...q1};
                    }

                    // Update Product Data
                    Product.updateOne({_id: m._id},
                        finalQuery,
                        {new: true, upsert: true, multi: true}).exec()
                });
            }


            message = 'Payment Completed Successfully!'

            // GET
            const apiEnd = "https://sms.sslwireless.com/pushapi/dynamic/server.php";
            ax.get(apiEnd, {
                params: smsData
            })
                .then(function (response) {
                    // console.log("response:");
                    // console.log(response.data);
                })
                .catch(function (error) {
                    console.log("error:");
                    console.log(error);
                });


        } else {
            // console.log('Iam on Failed>>>>>>>>>>>')
            // console.log("data", data);
            // console.log("id:", data.tran_id);
            const tempOrderData = await OrderTemp.findOne({orderId : data.tran_id})
            // console.log("Temp Order Data :",tempOrderData);


            const productIds = tempOrderData.orderedItems.map(m => new ObjectId(m.product));
            const query = {_id: {$in: productIds}};
            const eProduct = await Product.find(query).select('quantity');
            incrementQty(tempOrderData.orderedItems, eProduct);
            await OrderTemp.deleteOne({_id: tempOrderData._id});
            // GET
            const smsDataFailed = {
                user: process.env.SMSUSER,
                pass: process.env.SMSPASS,
                msisdn: '88' + tempOrderData.phoneNo,
                sms: `Dear ${tempOrderData.name}, Your payment BDT ${total_amount} for the order ${tranId} is failed. Please attempt again to confirm your order. For Support: 8809610001010.`,
                sid: process.env.SMSSID,
                csmsid: tempOrderData.phoneNo
            }

            // console.log(smsDataFailed);

            const apiEnd = "https://sms.sslwireless.com/pushapi/dynamic/server.php";
            ax.get(apiEnd, {
                params: smsDataFailed
            })
                .then(function (response) {
                    // console.log("response:");
                    // console.log(response.data);
                })
                .catch(function (error) {
                    console.log("error:");
                    console.log(error);
                });

            message = 'Payment Was Not Completed Successfully!'

        }

        res.status(200).json({
            message: message
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


/**
 * ADDITIONAL FUNCTIONS
 */
function padLeadingZeros(num) {
    return String(num).padStart(4, '0');
}

function incrementSoldQuantityQuery(item) {
    let query;
    if (item.productSoldQty) {
        query =  {
            $inc: {
                soldQuantity: item.soldQuantity ? item.soldQuantity : 1
            }
        };
    } else {
        query = {
            $set: {
                soldQuantity: item.soldQuantity ? item.soldQuantity : 1
            }
        };
    }
    return query;
}

async function incrementQty(data, eproduct) {
    
    data.forEach((m, i) => {
        const filter = eproduct[i]._id;
        qty = eproduct[i].quantity + m.quantity;
        const update = { quantity: qty };
        Product.findByIdAndUpdate(filter, update).exec()
    });
}

function decrementQuantityQuery(item) {
    let query;
    if (item.productQty) {
        query =  {
            $inc: {
                quantity: -(item.soldQuantity ? item.soldQuantity : 1)
            }
        };
    } else {
        query = {
            $set: {
                quantity: -(item.soldQuantity ? item.soldQuantity : 1)
            }
        };
    }

    return query;
}
