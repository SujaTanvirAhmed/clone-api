/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    readOnly: {
      type: Boolean,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    // mobileImage: {
    //   type: String,
    //   required: true,
    // },
    routerLink: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PromoBanner", schema);
