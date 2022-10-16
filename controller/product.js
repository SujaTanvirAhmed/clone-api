const { validationResult } = require('express-validator');

// Require Post Schema from Model..
const Product = require('../models/product');
const Review = require('../models/review-control');
const User = require("../models/user");
const ObjectId = require('mongoose').Types.ObjectId;
const utils = require('../helpers/utils')
const ProductAttribute = require('../models/product-attribute');

/**
 * Add Product
 * Add Bulk Book
 * Get All Book List
 * Single Book by Slug
 */

exports.addSingleProduct = async (req, res, next) => {

    try {
        const data = req.body;
        const dataExists = await Product.findOne({ productSlug: data.productSlug }).lean();

        if (dataExists) {
            const error = new Error('A product with this name/slug already exists');
            error.statusCode = 406;
            next(error)
        } else {
            const product = new Product(data);
            // PRODUCT
            const productRes = await product.save();

            res.status(200).json({
                response: productRes,
                message: 'Product Added Successfully!'
            });
        }

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.insertManyProduct = async (req, res, next) => {

    try {
        const data = req.body;
        await Product.deleteMany({});
        const result = await Product.insertMany(data);

        res.status(200).json({
            message: `${result && result.length ? result.length : 0} Products imported Successfully!`
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


exports.getAllProducts = async (req, res, next) => {
    try {
        let paginate = req.body.paginate;
        let filter = req.body.filter;

        let queryData;
        let dataCount;

        let priceRange = {
            minPrice: 0,
            maxPrice: 0
        }
        let minPrice;
        let maxPrice;

        let type = 'default';
        let i = -1;

        if (filter) {

            if ('categorySlug' in filter) {
                type = 'cat';
                i = index;
            }
            ;
            if ('subCategorySlug' in filter) {
                type = 'subCat';
                i = index;
            }
            ;
            if ('tags' in filter) {
                type = 'tag';
                i = index;
            }
            ;

            if (type == 'cat') {
                minPrice = Product.find(filter[i]).sort({ price: 1 }).limit(1);
                maxPrice = Product.find(filter[i]).sort({ price: -1 }).limit(1);
            } else if (type == 'subCat') {
                minPrice = Product.find(filter[i]).sort({ price: 1 }).limit(1);
                maxPrice = Product.find(filter[i]).sort({ price: -1 }).limit(1);
            } else if (type == 'tag') {
                minPrice = Product.find(filter[i]).sort({ price: 1 }).limit(1);
                maxPrice = Product.find(filter[i]).sort({ price: -1 }).limit(1);
            } else {
                minPrice = Product.find().sort({ price: 1 }).limit(1);
                maxPrice = Product.find().sort({ price: -1 }).limit(1);
            }
        } else {
            minPrice = Product.find().sort({ price: 1 }).limit(1);
            maxPrice = Product.find().sort({ price: -1 }).limit(1);
        }

        const temp1 = await minPrice;
        const temp2 = await maxPrice;

        priceRange.minPrice = temp1.length > 0 ? temp1[0].price : 0;
        priceRange.maxPrice = temp2.length > 0 ? temp2[0].price : 0;

        if (filter) {
            queryData = Product.find({ ...filter, ...{ productVisibility: true } });
        } else {
            queryData = Product.find({ productVisibility: true });
        }

        if (paginate) {
            queryData.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }

        const data = await queryData
            // .populate('-shortDescription -description')
            .populate('attributes')
            .populate('brand')
            .populate('category')
            .populate('subCategory')
            .populate('tags')
            .select('productName images productSlug price discountType ratingReview discountAmount category brandSlug categorySlug brand sku subCategorySlug tags quantity campaignStartDate campaignEndDate campaignStartTime campaignEndTime productVisibility')
            .sort({ createdAt: -1 })

        if (filter) {
            dataCount = await Product.countDocuments(filter);
        } else {
            dataCount = await Product.countDocuments();
        }

        // Check Campaign
        if (data && data.length) {
            data.forEach(m => {
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
        res.status(200).json({
            data: data,
            priceRange: priceRange,
            count: dataCount
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

exports.getProductsByDynamicSort = async (req, res, next) => {
    try {
        let paginate = req.body.paginate;
        let filter = req.body.filter;
        let sort = req.body.sort;
        let select = req.body.select;

        let queryDoc;
        let countDoc;


        // Filter
        if (filter) {
            queryDoc = Product.find(filter);
            countDoc = Product.countDocuments(filter);
        } else {
            queryDoc = Product.find();
            countDoc = Product.countDocuments();
        }


        // Sort
        if (sort) {
            queryDoc = queryDoc.sort(sort);
        }

        // Pagination
        if (paginate) {
            queryDoc.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }

        if (select) {
            queryDoc.select(select)
        }

        const data = await queryDoc
            .populate('attributes')
            .populate('brand')
            .populate('category')
            .populate('subCategory')
            .populate('tags')

        const count = await countDoc;

        res.status(200).json({
            data: data,
            count: count
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

exports.getSingleProductBySlug = async (req, res, next) => {
    const productSlug = req.params.slug;
    try {
        const query = { productSlug: productSlug };
        const data = await Product.findOne(query)
            // .select('-shortDescription -description -deliveryPolicy -paymentPolicy -warrantyPolicy')
            .populate('brand')
            .populate('category')
            .populate('subCategory')
            .populate('tags')


        // Check Discount with Campaign
        if (data.campaignStartDate && data.campaignEndDate) {
            const startDateTime = utils.convertToDateTime(data.campaignStartDate, data.campaignStartTime);
            const endDateTime = utils.convertToDateTime(data.campaignEndDate, data.campaignEndTime);

            const startTimeFromNow = utils.getDateTimeDifference(startDateTime);
            const endTimeFromNow = utils.getDateTimeDifference(endDateTime);

            // startTimeFromNow > 0 ---> Not Start Yet ** Discount will be 0 **
            // startTimeFromNow < 0 ---> Already Started ** Discount will live **
            // endTimeFromNow > 0 ---> Running ** Discount will live **
            // endTimeFromNow < 0 ---> Expired ** Discount will be 0 **
            // console.log(startDateTime);
            // console.log(endDateTime);
            // console.log(startTimeFromNow);
            // console.log(endTimeFromNow);

            if (startTimeFromNow > 0 || endTimeFromNow <= 0) {
                data.discountType = null;
                data.discountAmount = 0;
            }
        }


        res.status(200).json({
            data: data,
            message: 'Product fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSingleProductById = async (req, res, next) => {
    const id = req.params.id;

    try {
        const query = { _id: id };
        const data = await Product.findOne(query)
            .populate('attributes')
            .populate('brand')
            .populate('category')
            .populate('subCategory');

        res.status(200).json({
            data: data,
            message: 'Product fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getProductByTagId = async (req, res, next) => {
    const id = req.params.id;

    console.log("My tag ID", id)

    const pageSize = +req.query.pageSize;
    console.log("My page size", pageSize)

    const currentPage = +req.query.currentPage;
    console.log("My currentPage", currentPage)


    try {
        const query = { tags: id, productVisibility: true };
        const data = Product.find(query)
            // .select('-shortDescription -description -deliveryPolicy -paymentPolicy -warrantyPolicy')
            .populate('brand')
            .populate('category')
            .populate('subCategory')
            .populate('tags')



        if (pageSize && currentPage) {
            data.skip(pageSize * (currentPage - 1)).limit(Number(pageSize))
        }




        const results = await data;
        console.log('results',results )
        const count = await Product.countDocuments(query);
        
        res.status(200).json({
            data: results,
            count: count,
            message: 'Product fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}
exports.getRelatedProducts = async (req, res, next) => {

    const id = req.params.id;
    const category = req.params.category;
    const subCategory = req.params.subCategory;

    try {

        const data = await Product.aggregate([
            {
                $match:
                {
                    $or: [
                        { category: new ObjectId(category) },
                        { subCategory: new ObjectId(subCategory) },
                    ],
                    $nor: [
                        {
                            $and: [
                                {
                                    _id: new ObjectId(id)
                                },
                                {
                                    productVisibility: false
                                },
                                { quantity: { $lte: 0 } }
                            ]
                        }
                    ]
                }
            },
            {
                $sample:
                {
                    size: 5
                }
            }
        ])

        // const data = await Product.find({category: category, subCategory: subCategory, $nor:[{$and:[{'_id': id}]}]});

        res.status(200).json({
            data: data,
            message: 'Product fetch Successfully!'
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

exports.getRecommendedProducts = async (req, res, next) => {

    const data = req.body.data;
    let productIds = [];
    let subCategoryIds = [];

    if (data) {
        data.productIds.forEach(id => {
            productIds.push(new ObjectId(id))
        });

        data.subCategoryIds.forEach(id => {
            subCategoryIds.push(new ObjectId(id))
        });

        // productIds = data.productIds;
        // subCategoryIds = data.subCategoryIds;
    }

    try {

        const data = await Product.aggregate([
            {
                $match:
                {
                    $or: [
                        { subCategory: { $in: subCategoryIds } },
                    ],
                    $nor: [
                        {
                            $and: [

                                { _id: { $in: productIds } },
                                { quantity: { $lte: 0 } },
                                { productVisibility: false },
                            ]
                        }
                    ]
                }
            },
            {
                $sample:
                {
                    size: 6
                }
            }
        ])

        // const data = await Product.find({category: category, subCategory: subCategory, $nor:[{$and:[{'_id': id}]}]});

        res.status(200).json({
            data: data,
            message: 'Product fetch Successfully!'
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

exports.updateProductById = async (req, res, next) => {

    const data = req.body;
    try {
        await Product.findOneAndUpdate(
            { _id: data._id },
            { $set: data }
        )

        res.status(200).json({
            message: 'Product Update Successfully!'
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

exports.updateMultipleProductById = async (req, res, next) => {

    const data = req.body;
    try {
        data.forEach(m => {
            Product.findByIdAndUpdate(m._id,
                { $set: m },
                { new: true, multi: true }
            ).exec()
        });

        res.status(200).json({
            message: 'Bulk Product Update Successfully!'
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


// Not Completed Yet
exports.updateProductImageField = async (req, res, next) => {

    try {
        const id = req.body.id;
        const data = req.body.images.length === 0 ? null : req.body.images

        await Product.findOneAndUpdate({ _id: id }, {
            "$set": {
                primaryImages: data
            }
        })
        res.status(200).json({
            message: 'Product Image Updated Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

// Skip For Now
// exports.editProductData = async (req, res, next) => {

//     const updatedProduct = req.body.product;
//     const updatedProductExtra = req.body.extraData;

//     try {
//         const oldProduct = await Product.findOne({_id: updatedProduct._id});
//         await Product.findOneAndUpdate(
//             {_id: updatedProduct._id},
//             {$set: updatedProduct}
//             );
//         await ProductExtraData.findOneAndUpdate(
//             {_id: updatedProductExtra._id},
//             {$set: updatedProductExtra}
//             );

//         // Update Brand Ref

//         if (oldProduct.brand !== updatedProduct.brand) {
//             await Brand.updateOne(
//                 {_id: oldProduct.brand},
//                 {
//                     $pull: {products: oldProduct._id}
//                 }
//             )
//             await Brand.findOneAndUpdate({_id: updatedProduct.brand}, {
//                 "$push": {
//                     products: updatedProduct._id
//                 }
//             })
//         }

//         res.status(200).json({
//             message: 'Product Updated Success!'
//         });
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

// exports.deleteProductById = async (req, res, next) => {
//
//     const productId = req.params.id;
//
//     try {
//         const query = {_id: productId}
//         await Product.deleteOne(query)
//
//         res.status(200).json({
//             message: 'Product deleted Successfully!'
//         });
//
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
//
// }

exports.deleteProductById = async (req, res, next) => {

    const productId = req.params.id;

    try {
        const query = { _id: productId }
        await Product.deleteOne(query)
        await Review.deleteOne({ product: productId })

        res.status(200).json({
            message: 'Product deleted Successfully!'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}

exports.productFilterByQuery = async (req, res, next) => {

    try {
        const query = req.body.query;
        const paginate = req.body.paginate;
        let queryProduct;

        let priceRange = {
            minPrice: 0,
            maxPrice: 0
        }
        let minPrice;
        let maxPrice;

        let type = 'default';
        let i = -1;

        if (query) {

            query.forEach((item, index) => {
                if ('tagSlug' in item) {
                    type = 'tag';
                    i = index;
                }
                if ('brandSlug' in item) {
                    type = 'brand';
                    i = index;
                }
                ;
                if ('categorySlug' in item) {
                    type = 'cat';
                    i = index;
                }
                ;
                if ('subCategorySlug' in item) {
                    type = 'subCat';
                    i = index;
                }
                ;
                if ('tags' in item) {
                    type = 'tag';
                    i = index;
                }
                ;
            });

            if (type == 'brand') {
                minPrice = Product.find(query[i]).sort({ price: 1 }).limit(1);
                maxPrice = Product.find(query[i]).sort({ price: -1 }).limit(1);
            } else if (type == 'cat') {
                minPrice = Product.find(query[i]).sort({ price: 1 }).limit(1);
                maxPrice = Product.find(query[i]).sort({ price: -1 }).limit(1);
            } else if (type == 'subCat') {
                minPrice = Product.find(query[i]).sort({ price: 1 }).limit(1);
                maxPrice = Product.find(query[i]).sort({ price: -1 }).limit(1);
            } else if (type == 'brand') {
                minPrice = Product.find(query[i]).sort({ price: 1 }).limit(1);
                maxPrice = Product.find(query[i]).sort({ price: -1 }).limit(1);
            } else if (type == 'tag') {
                minPrice = Product.find(query[i]).sort({ price: 1 }).limit(1);
                maxPrice = Product.find(query[i]).sort({ price: -1 }).limit(1);
            } else {
                minPrice = Product.find().sort({ price: 1 }).limit(1);
                maxPrice = Product.find().sort({ price: -1 }).limit(1);
            }
        } else {
            minPrice = Product.find().sort({ price: 1 }).limit(1);
            maxPrice = Product.find().sort({ price: -1 }).limit(1);
        }

        const temp1 = await minPrice;
        const temp2 = await maxPrice;

        priceRange.minPrice = temp1.length > 0 ? temp1[0].price : 0;
        priceRange.maxPrice = temp2.length > 0 ? temp2[0].price : 0;


        if (req.body.select) {
            queryProduct = Product.find({ $and: query })
                .select(req.body.select)
                .populate('attributes')
                .populate('tags')
                .populate('ratingReview')
                .populate('brand')
                .populate('category')
                .populate('subCategory');
        } else {
            queryProduct = Product.find({ $and: query })
                .populate('attributes')
                .populate('tags')
                .populate('ratingReview')
                .populate('brand')
                .populate('category')
                .populate('subCategory');
        }

        if (paginate) {
            queryProduct.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }

        const productsCount = await Product.countDocuments({ $and: query });
        const result = await queryProduct;

        // Check Campaign
        if (result && result.length) {
            result.forEach(m => {
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


        res.status(200).json({
            data: result,
            priceRange: priceRange,
            count: productsCount
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


exports.getSpecificProductsByIds = async (req, res, next) => {

    try {

        const dataIds = req.body.ids;
        const select = req.body.select;
        const query = { _id: { $in: dataIds } }
        const data = await Product.find(query)
            .select(select ? select : '')
            .populate('attributes')
            .populate('brand')
            .populate('category')
            .populate('subCategory')


        // Discount Check with Campaign
        if (data && data.length) {
            data.forEach(m => {
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


        res.status(200).json({
            data: data ? data : []
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

exports.getSpecificProductsById = async (req, res, next) => {

    try {

        const dataIds = req.body.productId;
        const query = { _id: { $in: dataIds } }
        const data = await Product.find(query).populate('extraData');
        // .select('_id name slug image price discountPercent availableQuantity author authorName');

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


// exports.getProductsByLimit = async (req, res, next) => {
//     try {
//         const pageSize = +req.query.pageSize;
//         const currentPage = +req.query.page;
//         const queryProduct = Product.find();

//         if (pageSize && currentPage) {
//             queryProduct.skip(pageSize * (currentPage - 1)).limit(pageSize)
//         }

//         const productsCount = await Product.countDocuments();

//         const data = await queryProduct
//             // .populate('category', '_id categoryName slug')
//             // .populate('subCategory', '_id subCatName slug')
//             // .populate('brand', '_id brandName slug')

//         res.status(200).json({
//             data: data,
//             count: productsCount
//         });
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

// exports.getSpecificProductsByIds = async (req, res, next) => {

//     try {

//         const dataIds = req.body.productId;
//         const query = {_id: {$in: dataIds}}
//         const data = await Product.find(query).populate('productExtraData');
//             // .select('_id name slug image price discountPercent availableQuantity author authorName');

//         res.status(200).json({
//             data: data
//         });

//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

// exports.getMaxMinPrice = async (req, res, next) => {
//     try {

//         const query = req.body;

//         const data = await Product.aggregate([
//             { $match:
//                  query
//             },
//             { $group: {
//                 "_id": null,
//                 "max": { "$max": "$salePrice" },
//                 "min": { "$min": "$salePrice" }
//             }}
//          ]);
//         res.status(200).json({
//             data: data,
//             message: 'Max - Min price retrieved successfully!'
//         });
//     } catch (err) {
//         console.log(err);
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

// exports.productFilterByMinMax = async (req, res, next) => {

//     try {
//         const query = req.body.query;
//         const paginate = req.body.paginate;
//         const min = req.body.range.min;
//         const max =  req.body.range.max;
//         const sort = req.body.sort;
//         // console.log(req.body.sort);

//         const queryProduct = Product.aggregate([
//             { $match:
//                 query
//             },
//             { $match:
//                 {
//                     salePrice: { "$gt": min - 1, "$lt": max + 1 }
//                 }
//             },
//             { $sort :
//                 {
//                     salePrice : sort
//                 }
//             }
//         ]);

//         if (paginate) {
//             queryProduct.skip(paginate.pageSize * (paginate.currentPage - 1)).limit(paginate.pageSize)
//         }

//         const result = await queryProduct;

//         const count = await Product.aggregate(
//             [
//                 { $match:
//                     query
//                 },
//                 { $match:
//                     {
//                         salePrice: { "$gt" : min - 1, "$lt": max + 1}
//                     }
//                 },
//                 { $count:
//                     "productsCount"
//                 }
//             ]
//         );

//         // console.log(count[0].productsCount);

//         res.status(200).json({
//             data: result,
//             count: count[0].productsCount
//         });

//     } catch (err) {
//         console.log(err)
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

// exports.getSearchProductByRegex = async (req, res, next) => {
//     try {

//         // console.log(req.query.s);

//         const query = req.query.q;
//         const sort = parseInt(req.query.s);
//         // console.log(sort);
//         const paginate = req.body.paginate;

//         // SPLIT STRING AND REGEX
//         const newQuery = query.split(/[ ,]+/);
//         const queryArray = newQuery.map((str) => ({name: RegExp(str, 'i')}));
//         // console.log(queryArray);

//         // REGEX ONLY
//         const regex = new RegExp(query, 'i')
//         // console.log(regex);

//         if (sort !== 0) {

//             // console.log("Sort");

//             products = Product.find({

//                 $or: [
//                     {
//                         $and: queryArray
//                     },
//                     {productCode: regex}
//                 ]

//             }).sort({ "salePrice": sort});

//         } else {

//             // console.log("No Sort");

//             products = Product.find({

//                 $or: [
//                     {
//                         $and: queryArray
//                     },
//                     {productCode: regex}
//                 ]

//             });

//         }

//         if (paginate) {
//             products.skip(paginate.pageSize * (paginate.currentPage - 1)).limit(paginate.pageSize)
//         }

//         const results = await products;

//         const count = results.length;

//         // console.log(results);
//         // console.log(count);

//         res.status(200).json({
//             data: results,
//             count: count
//         });
//     } catch (err) {
//         console.log(err);
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

// exports.filterByCatSubCatBrandFilters = async (req, res, next) => {
//     try {

//         const util = require('util');

//         const data = req.body;
//         // console.log("Data Starts Here");
//         // console.log(util.inspect(data, {showHidden: false, depth: null}));
//         // console.log("Data Ends Here");

//         const catSlug = data.filter.fixedData.categorySlug;
//         const subCatSlug = data.filter.fixedData.subCatSlug;
//         const filterData = data.filter.filterData;

//         // console.log(filterData);

//         mappedFilterData = filterData.map(a => (key => ({ key:key, value: a[key] }))(Object.keys(a)[0]));

//         var sortedObj = {};
//         var sortedArrObj = {};
//         let string = "";
//         for( var i = 0, max = mappedFilterData.length; i < max ; i++ ){
//             const temp = mappedFilterData[i].key;
//             string = temp.substring(0, 0) + temp.substring(8, temp.length);
//             if( sortedObj[mappedFilterData[i].key] == undefined ){
//                 sortedArrObj[string] = [];
//                 sortedObj[mappedFilterData[i].key] = [];
//             }
//             const obj = {[mappedFilterData[i].key]: mappedFilterData[i].value}
//             sortedArrObj[string].push(obj);
//             sortedObj[mappedFilterData[i].key].push(obj);
//         }

//         const sortedArrObjNoKey = Object.values(sortedArrObj);

//         let queryArray = [];
//         // here each element is an array
//         sortedArrObjNoKey.forEach(element => queryArray.push({"$or": element}));
//         // console.log(util.inspect(queryArray, {showHidden: false, depth: null}));

//         let queryProduct = null;
//         let count = null;

//         const paginate = data.paginate;

//         count = await Product.countDocuments(
//             {
//                 $and: [
//                     {
//                         $and: queryArray
//                     },
//                     {categorySlug: catSlug},
//                     {subCatSlug: subCatSlug}
//                 ]
//             }
//         );
//         console.log(count);

//         queryProduct = await Product.find(
//             {
//                 $and: [
//                     {
//                         $and: queryArray
//                     },
//                     {categorySlug: catSlug},
//                     {subCatSlug: subCatSlug}
//                 ]
//             }
//         ).skip(paginate.pageSize * (paginate.currentPage - 1)).limit(paginate.pageSize);

//         res.status(200).json({
//             data: queryProduct,
//             count: count
//         });

//     } catch (err) {
//         console.log(err);
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

// exports.ultimateQuery = async (req, res, next) => {

//     try {

//         const util = require('util');
//         // console.log("");
//         // console.log("");
//         // console.log("<----- Body Data ----->");
//         // console.log("");
//         // console.log(util.inspect(req.body, {showHidden: false, depth: null}))

//         // CATEGORY SUB-CATEGORY SLUG
//         const query = req.body.query;

//         // PAGINATION
//         const paginate = req.body.paginate;

//         // PRICE SORT
//         let sort = 1;
//         if(req.body.sort){
//             sort = req.body.sort;
//         }

//         // PRICE RANGE
//         let min = 0;
//         let max = 10000000;
//         if(req.body.range){
//             min = req.body.range.min;
//             max =  req.body.range.max;
//         }

//         // FILTER
//         let filterData = null;
//         let queryArray = [];
//         if(req.body.filterData) {
//             mappedFilterData = req.body.filterData.map(a => (key => ({ key:key, value: a[key] }))(Object.keys(a)[0]));
//             var sortedObj = {};
//             var sortedArrObj = {};
//             let keys = "";
//             for( var i = 0, maximum = mappedFilterData.length; i < maximum ; i++ ){
//                 const temp = mappedFilterData[i].key;
//                 keys = temp.substring(0, 0) + temp.substring(8, temp.length);
//                 if( sortedObj[mappedFilterData[i].key] == undefined ){
//                     sortedArrObj[keys] = [];
//                     sortedObj[mappedFilterData[i].key] = [];
//                 }
//                 const obj = {[mappedFilterData[i].key]: mappedFilterData[i].value}
//                 sortedArrObj[keys].push(obj);
//                 sortedObj[mappedFilterData[i].key].push(obj);
//             }
//             const sortedArrObjNoKey = Object.values(sortedArrObj);
//             // here each element is an array
//             sortedArrObjNoKey.forEach(element => queryArray.push({"$or": element}));
//             filterData = queryArray;
//             // console.log("");
//             // console.log("<----- Processed Filter Data ----->");
//             // console.log("");
//             // console.log(util.inspect(filterData, {showHidden: false, depth: null}))
//         }

//         let queryProduct = null;
//         let searchQuery;

//         if (filterData) {
//             searchQuery = Product.aggregate(
//                 [
//                     { $match:
//                         query
//                     },
//                     { $match:
//                             {
//                                 salePrice: { "$gt" : min - 1, "$lt": max + 1}
//                             }
//                     },
//                     { $match:
//                             {
//                                 $and: queryArray
//                             }
//                     },
//                     {
//                         $count: "searchCount"
//                     }
//                 ]
//             )


//             queryProduct = Product.aggregate([
//                 { $match:
//                     query
//                 },
//                 { $match:
//                     {
//                         salePrice: { "$gt" : min - 1, "$lt": max + 1}
//                     }
//                 },
//                 { $match:
//                     {
//                         $and: queryArray
//                     }
//                 },
//                 { $sort :
//                     {
//                         salePrice : sort
//                     }
//                 },
//                 { $project :
//                     {
//                         name_fuzzy: 0
//                     }
//                 }
//             ]);
//         } else {

//             searchQuery = Product.aggregate(
//                 [
//                     { $match:
//                         query
//                     },
//                     { $match:
//                             {
//                                 salePrice: { "$gt" : min - 1, "$lt": max + 1}
//                             }
//                     },
//                     {
//                         $count: "searchCount"
//                     }
//                 ]
//             )

//             queryProduct = Product.aggregate([
//                 { $match:
//                     query
//                 },
//                 { $match:
//                     {
//                         salePrice: { "$gt" : min - 1, "$lt": max + 1}
//                     }
//                 },
//                 { $sort :
//                     {
//                         salePrice : sort
//                     }
//                 }
//             ]);
//         }

//         if (paginate) {
//             queryProduct.skip(paginate.pageSize * (paginate.currentPage - 1)).limit(paginate.pageSize)
//         }

//         const result = await queryProduct;
//         const count = await searchQuery;
//         // console.log(count)
//         //
//         // console.log("");
//         // console.log("<----- Count ----->");
//         // console.log("");
//         // console.log(util.inspect(count, {showHidden: false, depth: null}))

//         res.status(200).json({
//             data: result,
//             count: count && count.length > 0 ? Number(count[0].searchCount) : 0
//         });

//     } catch (err) {
//         console.log(err)
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

exports.getProductsBySearch = async (req, res, next) => {
    try {

        // Query Text
        const search = req.query.q;

        // Additional Filter
        const filter = req.body.filter;

        // Pagination
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;

        // Build Regex Query
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({ productName: RegExp(str, 'i') }));
        const queryArray2 = newQuery.map((str) => ({ sku: RegExp(str, 'i') }));
        // const queryArray3 = newQuery.map((str) => ({phoneNo: RegExp(str, 'i')}));
        // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')


        let dataDoc;
        let countDoc;

        if (filter) {
            dataDoc = Product.find({
                $and: [
                    filter,
                    {
                        $or: [
                            { $and: queryArray },
                            { $and: queryArray2 },
                            // {$and: queryArray3},
                            // {$and: queryArray4},
                        ]
                    }
                ]
            });

            countDoc = Product.countDocuments({
                $and: [
                    filter,
                    {
                        $or: [
                            { $and: queryArray },
                            { $and: queryArray2 },
                            // {$and: queryArray3},
                            // {$and: queryArray4},
                        ]
                    }
                ]
            });
        } else {
            dataDoc = Product.find({
                $or: [
                    { $and: queryArray },
                    { $and: queryArray2 },
                    // {$and: queryArray3},
                    // {$and: queryArray4},
                ]
            });

            countDoc = Product.countDocuments({
                $or: [
                    { $and: queryArray },
                    { $and: queryArray2 },
                    // {$and: queryArray3},
                    // {$and: queryArray4},
                ]
            });
        }


        // {marketer: {$in: [null]}}

        if (pageSize && currentPage) {
            dataDoc.skip(pageSize * (currentPage - 1)).limit(Number(pageSize))
        }

        const results = await dataDoc;
        const count = await countDoc;

        res.status(200).json({
            data: results,
            count: count
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
 * DATABASE HANDLE
 */

exports.removeAllCampaignAndDiscount = async (req, res, next) => {
    try {

        await Product.updateMany({},
            {
                $set: {
                    discountType: null,
                    discountAmount: 0,
                    campaignStartDate: null,
                    campaignStartTime: null,
                    campaignEndDate: null,
                    campaignEndTime: null
                }
            })

        res.status(200).json({
            message: 'Successfully updated data'
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
