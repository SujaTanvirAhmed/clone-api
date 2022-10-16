const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: false
    },
    promotionalOffer: {
        type: Schema.Types.ObjectId,
        ref: 'PromotionalOffer',
        required: true
    },
    promotionalOfferSlug: {
        type: String,
        required: false
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
}, 
{
    timestamps: true
});


module.exports = mongoose.model('OfferProduct', schema);