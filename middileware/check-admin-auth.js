const jwt = require('jsonwebtoken');
const secureFunctions = require('../helpers/secure-functions');

module.exports = (req, res, next) => {
    const authHeader = req.get('Administrator');
    if(!authHeader) {
        const error = new Error('Sorry! Not a Administrator.');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        const decryptToken = secureFunctions.decryptString(token, process.env.ADMIN_TOKEN_SECRET);
        if (decryptToken) {
            decodedToken = jwt.verify(decryptToken, process.env.JWT_PRIVATE_KEY_ADMIN);
            req.adminData = {
                username: decodedToken.username,
                userId: decodedToken.userId
            };
        } else {
            const error = new Error('Administrator Token Error!');
            error.statusCode = 401;
            next(error);
            return;
        }

    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken) {
        const error = new Error('Administrator Error!');
        error.statusCode = 401;
        throw error;
    }
    req.adminId = decodedToken.adminId;
    next();
}
