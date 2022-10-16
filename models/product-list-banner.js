const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    bHeight: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    routerLink: {
        type: String,
        required: false
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('ProductListBanner', schema);