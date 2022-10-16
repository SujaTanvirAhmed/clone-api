const Certificate = require('../models/certificate');
const utils = require('../helpers/utils')


exports.addSingleCertificate = async (req, res, next) => {

    try {

        const data = req.body;
        const dataExists = await Certificate.findOne({certificateNumber: data.certificateNumber}).lean();

        if (dataExists) {
            const error = new Error('A Certificate with this invoiceNumber already exists');
            error.statusCode = 406;
            next(error)
        } else {
            const certificate = new Certificate(data);
            const certificateRes = await Certificate.save();
            res.status(200).json({
                response: certificateRes,
                message: 'Certificate Added Successfully!'
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

exports.insertManyCertificate = async (req, res, next) => {

    try {
        const data = req.body;
        // await Warranty.deleteMany({});
        await Certificate.deleteMany({});
        const result = await Certificate.insertMany(data);

        res.status(200).json({
            message: `${result && result.length ? result.length : 0} Certificate\'s imported Successfully!`
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getAllCertificate = async (req, res, next) => {
    try {

        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.page;
        let query = Certificate.find();

        if (pageSize && currentPage) {
            query.skip(pageSize * (currentPage - 1)).limit(pageSize)
        }

        const results = await query;
        const count = await Certificate.countDocuments();

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

exports.getCertificateByCertificateId = async (req, res, next) => {

    try {
        const certificateId = req.params.certificateId;
        const productCertificate = await Certificate.findOne({_id: certificateId});

        res.status(200).json({
            data: productCertificate,
            message: 'Certificate Added Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getCertificateByCertificateRefNo = async (req, res, next) => {
    const refNo = req.params.refNo;
    try {
        const query = {refNumber: refNo};
        const data = await Certificate.findOne(query)

        res.status(200).json({
            data: data,
            message: 'Certificate fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getCertificateBycertificateNumber = async (req, res, next) => {
    const certificateNumber = req.params.certificateNumber;
    try {
        const query = {certificateNumber: certificateNumber};
        const data = await Certificate.findOne(query)
        // console.log('getCertificateBycertificateNumber data:', data);

        res.status(200).json({
            data: data,
            message: 'Certificate fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}
exports.checkCertificateByCustomerPhoneNo = async (req, res, next) => {

    try {
        const customerPhoneNo = req.body.customerPhoneNo;

        const productCertificate = await Certificate.find({customerPhoneNo: customerPhoneNo})

        res.status(200).json({
            success: !!(productCertificate && productCertificate.length)
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getCertificateDataByCustomer = async (req, res, next) => {

    try {
        const customerPhoneNo = req.body.customerPhoneNo;
        const select = req.body.select;

        const productWarranty = await Certificate.find({customerPhoneNo: customerPhoneNo})
            .select(select ? select : '');

        res.status(200).json({
            data: productWarranty,
            success: !!(productWarranty && productWarranty.length)
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.trackCertificateDownloadHistory = async (req, res, next) => {

    try {
        const userId = req.userData.userId;
        const id = req.body._id;


        await Certificate.findOneAndUpdate(
            {_id: id},
            {$set: {user: userId, lastDownload: utils.getDateString(new Date())}, $inc: {totalDownload: 1}},
            {new: true, upsert: true}
        )

        res.status(200).json({
            success: true
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editCertificateData = async (req, res, next) => {

    try {
        const updatedData = req.body;
        await Certificate.updateOne({_id: updatedData._id}, {$set: updatedData})

        res.status(200).json({
            message: 'Certificate Updated Successfully!'
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

exports.deleteCertificateByCertificateId = async (req, res, next) => {

    try {
        const certificateId = req.params.certificateId;
        await Certificate.deleteOne({_id: certificateId});

        res.status(200).json({
            message: 'Certificate Deleted Successfully',
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getMultipleCertificateById = async(req,res,next)=>{
    try {
        //console.log('--------------------------[974]------------------------------')
        const ids=req.body;
        //console.log(ids)
        const query = {_id: {$in: ids}}
        const data = await Certificate.find(query)
        .sort({ createdAt: -1 });
       // console.log(data);
        res.status(200).json({
            data:data,
            count:data.length,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}
exports.getAllCertificateByAdminNoPaginate = async (req, res, next) => {
    try {

        const order = await Certificate.find()
            .sort({ createdAt: -1 });
        const message = "Successfully retrieved orders";

        res.status(200).json({
            data: order,
            message: message
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}

exports.updateMultipleCertificate = async (req, res, next) => {
    const data = req.body;


    try {
        
        data.forEach(async (m) => {

           
            Certificate.findByIdAndUpdate(m._id,
                { $set: m },
                { new: true, multi: true }
            ).exec()


        });

        res.status(200).json({
            message: 'Bulk Certificate Updated Successfully!'
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
exports.getCertificateBySearch = async (req, res, next) => {
    try {

        const search = req.query.q;
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({certificateNumber: RegExp(str, 'i')}));
        const queryArray2 = newQuery.map((str) => ({storeName: RegExp(str, 'i')}));
        const queryArray3 = newQuery.map((str) => ({dealerName: RegExp(str, 'i')}));
        const queryArray4 = newQuery.map((str) => ({phoneNo: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')

        let productWarranty = Certificate.find({
            $or: [
                {$and: queryArray},
                {$and: queryArray2},
                {$and: queryArray3},
                {$and: queryArray4}
            ]
        });

        if (pageSize && currentPage) {
            productWarranty.skip(pageSize * (currentPage - 1)).limit(Number(pageSize))
        }

        const results = await productWarranty;
        const count = results.length;


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
