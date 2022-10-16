const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
    productName: {
        type: String,
        required: true
    },
    productSlug: {
        type: String,
        required: true
    },
    videoLink:{
        type: String,
        required: false
    },
    sku: {
        type: String,
        required: false
    },
    images: [{
        type: String,
        required: false
    }],
    price: {
        type: Number,
        required: true
    },
    discountType: {
        type: Number,
        required: false
    },
    discountAmount: {
        type: Number,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    soldQuantity: {
        type: Number,
        required: false
    },
    deliveredQuantity: {
        type: Number,
        required: false
    },
    attributes: [{
        type: Schema.Types.ObjectId,
        ref: 'ProductAttribute'
    }],
    filterData: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'ProductAttribute'
        },
        attributeName: {
            type: String,
            required: false
        },
        attributeValues: {
            type: String,
            required: false
        }
    }],

    brand: {
        type: Schema.Types.ObjectId,
        ref: 'ProductBrand'
    },
    brandSlug: {
        type: String
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'ProductCategory'
    },
    categorySlug: {
        type: String
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: 'ProductSubCategory'
    },
    subCategorySlug: {
        type: String
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    ratingReview: [{
        type: Schema.Types.ObjectId,
        ref: 'ProductRatingReview'
    }],
    discussion: [{
        type: Schema.Types.ObjectId,
        ref: 'Discussion'
    }],
    warrantyServices: {
        type: String,
        required: false
    },
    shortDescription: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    stockVisibility: {
        type: Boolean,
        required: false
    },
    productVisibility: {
        type: Boolean,
        required: false
    },
    deliveryPolicy: {
        type: String,
        required: false
    },
    paymentPolicy: {
        type: String,
        required: false
    },
    warrantyPolicy: {
        type: String,
        required: false
    },
    campaignStartDate: {
        type: String,
        required: false
    },
    campaignStartTime: {
        type: String,
        required: false
    },
    campaignEndDate: {
        type: String,
        required: false
    },
    campaignEndTime: {
        type: String,
        required: false
    },
    youtubeUrl: {
        type: String,
        required: false
    },
    emiStatus: [{
        type: [Number],
        required: false
    }],
}, {
    versionKey: false,
    timestamps: true
});


module.exports = mongoose.model('Product', schema);
