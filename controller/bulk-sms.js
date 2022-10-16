const ax = require("axios");
const secureFunctions = require('../helpers/secure-functions')


exports.sendSmsBySslAPi = async (req, res, next) => {
    const apiEnd = process.env.SSL_SMS_API;
    const {data} = req.body;
    if (data && typeof data === 'string') {
        const mgsData = secureFunctions.decryptStringObject(data, process.env.API_TOKEN_SECRET);

        if (mgsData) {
            const authData = {
                user: process.env.SMSUSER,
                pass: process.env.SMSPASS,
                sid: process.env.SMSSID
            }

            // console.log('mgsData', mgsData)

            const finalSmsData = {...authData, ...mgsData};

            console.log('bulk final Data', finalSmsData)

            // Handle SMS API WITH AXIOS
            ax.get(apiEnd, {
                params: finalSmsData
            }).then(function (response) {
                res.status(200).json({
                    success: true
                });
            }).catch(function (error) {
                console.log("error:");
                res.status(200).json({
                    success: false
                });
                console.log(error);
            });
        } else {
            res.status(403).json({
                success: false,
                message: 'Permission denied.'
            });
        }
    } else {
        res.status(400).json({
            success: false,
            message: 'Request not acceptable'
        });
    }

}
