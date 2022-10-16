const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
    // refNumber: {
    //     type: String,
    //     required: true
    // },
    certificateNumber: {
        type: String,
        required: true
    },
    storeName: {
        type: String,
        required: true
    },
    dealerName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    validity: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Certificate', schema);
