/** @format */

// Require Main Modules..
const { validationResult } = require("express-validator");

const PromoBanner = require("../models/product-promo-banner");

/**
 * BASIC INFO
 */

exports.addPromoBanner = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(
      "Input Validation Error! Please complete required information."
    );
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }

  try {
    const data = req.body;
    const promoBanner = new PromoBanner(data);
    await promoBanner.save();

    res.status(200).json({
      message: "Product Promo Banner Added Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getPromoBanner = async (req, res, next) => {
  try {
    const data = await PromoBanner.findOne();

    res.status(200).json({
      data: data,
      message: "Product Promo Banner info Get!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.updatePromoBannerInfo = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(
      "Input Validation Error! Please complete required information."
    );
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }

  try {
    const id = req.body._id;

    await PromoBanner.findOneAndUpdate({ _id: id }, req.body);

    res.status(200).json({
      message: "Product Promo Banner Info Updated Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getPromoBannerbyId = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(
      "Input Validation Error! Please complete required information."
    );
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }

  const promoBannerId = req.params.promoBannerId;
  const promoBanner = await PromoBanner.findOne({ _id: promoBannerId });

  try {
    res.status(200).json({
      data: promoBanner,
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.editPromoBannerInfo = async (req, res, next) => {
  const updatedData = req.body;

  try {
    await PromoBanner.updateOne(
      { _id: updatedData._id },
      { $set: updatedData }
    );
    res.status(200).json({
      message: "Promo Promo Banner Updated Successfully!",
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.deletePromoBanner = async (req, res, next) => {
  try {
    const id = req.params.id;

    await PromoBanner.deleteOne({ _id: id });

    res.status(200).json({
      message: "Product Promo Banner Deleted Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};
