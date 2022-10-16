
// Require Post Schema from Model..

const Order = require('../models/order');
const OrderTemp = require('../models/order-temporary');
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require('../models/coupon');
const UniqueId = require("../models/unique-id");
const ObjectId = require('mongoose').Types.ObjectId;
const product = require('../models/product');

exports.placeTempOrder = async (req, res, next) => {

    try {

        const userId = req.userData.userId;
        const data = req.body;
        
        // Check Actual Stock
        const productIds = data.orderedItems.map(m => new ObjectId(m.product));
        const query = {_id: {$in: productIds}};
        const eProduct = await Product.find(query).select('quantity');
        
        // reduceQty(data.orderedItems, eProduct);


        // Match Actual Stock Quantity with Order Quantity
        let qtyResult = true;
        eProduct.forEach((m, i) => {
            const eQty = data.orderedItems[i].quantity ? data.orderedItems[i].quantity : 0;


            if (m.quantity < eQty) {
                qtyResult = false;

            }
        })

        if (qtyResult) {

            reduceQty(data.orderedItems, eProduct);


            // Increment Order Id Unique
            const incOrder = await UniqueId.findOneAndUpdate(
                {},
                { $inc: { orderId: 1 } },
                {new: true, upsert: true}
            )

            const orderIdUnique = padLeadingZeros(incOrder.orderId);
            const finalData = {...data, ...{user: userId, orderId: orderIdUnique}}

            const orderTemp = new OrderTemp(finalData);
            const orderTempSave = await orderTemp.save();

            if (req.body.couponId) {
                await Coupon.findByIdAndUpdate({_id: req.body.couponId}, { $push : { usedCoupons : userId } });
            }

            // UPDATE USER CARTS & CHECKOUT
            await User.findOneAndUpdate(
                {_id: userId},
                {$set: {carts: []}}
            )

            await Cart.deleteMany(
                {user: userId}
            )

            res.json({
                _id: orderTempSave._id,
                orderId: orderIdUnique,
                success: true,
                message: 'Data added successfully',
            })
        } else {
            res.json({
                _id: null,
                orderId: null,
                success: false,
                message: `Out of stock! No Available quantity in order product`,
            })
        }



    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

async function reduceQty(data, eproduct) {
    // console.log("Hello minus");
    
    data.forEach((m, i) => {
        // console.log(m.quantity);
        // console.log(eproduct[i]);
        // console.log(eproduct[i].quantity);
        const filter = eproduct[i]._id;
        qty = eproduct[i].quantity - m.quantity;
        // console.log(qty);
        const update = { quantity: qty };
        Product.findByIdAndUpdate(filter, update).exec()
    });
}
function incrementQty () {
    console.log("Hello plus");
}


exports.updateSessionKey = async (req, res, next) => {

    try {

        const tranId = req.params.tranId;
        const sessionkey = req.params.sessionkey;
        const tempOrder = await OrderTemp.updateOne({_id: tranId}, {$set: {sessionkey: sessionkey}});

        res.json({
            message: 'Session Key Updated Successfully!',
        })

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

// exports.moveOrderToMainByTranId = async (req, res, next) => {

//     try {

//         const userId = req.userData.userId;


//         await User.findOneAndUpdate(
//             {_id: userId},
//             {$push: {checkouts: orderSave._id}}
//         )

//         res.json({
//             orderId: orderSave._id,
//             message: 'Data added successfully',
//         })

//     } catch (err) {
//         console.log(err)
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }



function padLeadingZeros(num) {
    return String(num).padStart(4, '0');
}

