/**
 * Created by Ajay Kumar Tripathi on 26/09/2020.
 */
const request = require('request')
const deliveryBoyApiController = require('./Controllers/sysadmin/deliveryBoyApiController');
const loginController = require('./Controllers/loginController');
const sysadminHomeController = require('./Controllers/sysadmin/homeController');
const endUserController = require('./Controllers/sysadmin/endUserController');
const venderController = require('./Controllers/sysadmin/venderController');
const dashboardController = require('./Controllers/dashboardControllers');
const couponController = require('./Controllers/sysadmin/couponControllers')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var Users = require('./Models/users');
const appRouteDeliveryBoy = express.Router();

/**
 * LOGIN ROUTE
 */

//const UsersCategory = require('./Models/userscategory');
//const systemModules = require('./Models/systemmodule');
var mongoose = require("mongoose");
/**
 * get all the Logins
 * @param req
 * @param res
 * @param next
 */

const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

/**
 *  UPLOADS DATA
 */
var upload = multer({ storage: storage });


/*New API Author by Ajay Kumar Tripathi*/
appRouteDeliveryBoy.post('/getUserData', deliveryBoyApiController.getUserData);
appRouteDeliveryBoy.post('/updateProfile', upload.single('profile_image'), deliveryBoyApiController.updateProfile);
appRouteDeliveryBoy.post('/changePassword',deliveryBoyApiController.changePassword);


appRouteDeliveryBoy.post('/register',upload.single('document'), deliveryBoyApiController.register);
appRouteDeliveryBoy.post('/login', deliveryBoyApiController.login);
appRouteDeliveryBoy.post('/sendOtp', deliveryBoyApiController.sendOtp);
appRouteDeliveryBoy.post('/verifyOtp', deliveryBoyApiController.verifyOtp);
appRouteDeliveryBoy.post('/forgetpassword', deliveryBoyApiController.forgetpassword);
appRouteDeliveryBoy.post('/upcomingBooking',deliveryBoyApiController.upcomingBooking);
appRouteDeliveryBoy.post('/recentBooking',deliveryBoyApiController.recentBooking);
appRouteDeliveryBoy.post('/allBooking',deliveryBoyApiController.allBooking);
appRouteDeliveryBoy.post('/bookingDetails', deliveryBoyApiController.bookingDetails);

appRouteDeliveryBoy.post('/getCMS',deliveryBoyApiController.getCMS);
appRouteDeliveryBoy.post('/getFAQ',deliveryBoyApiController.getFAQ);

/*appRoute.post('/api/bookGas', sysadminapiController.bookGas);
appRoute.post('/api/bookingList', sysadminapiController.bookingList);
appRoute.post('/api/bookingDetails', sysadminapiController.bookingDetails);

appRoute.post('/api/addCoupon', upload.single('image'), sysadminapiController.addCoupon);
appRoute.post('/api/getCouponList', sysadminapiController.getCouponList);

appRoute.post('/api/venderRegister', sysadminapiController.venderRegister);
appRoute.post('/api/getVenderList', sysadminapiController.getVenderList);


appRoute.post('/api/addCMS', sysadminapiController.addCMS);


appRoute.post('/api/addFAQ', sysadminapiController.addFAQ);
appRoute.post('/api/getFAQ', sysadminapiController.getFAQ);

appRoute.post('/api/addNotification', sysadminapiController.addNotification);
appRoute.post('/api/getNotification', sysadminapiController.getNotification);
appRoute.post('/api/IsViewNotification', sysadminapiController.IsViewNotification);*/




/**
 *  Authentication Function
 */
function requiresLogin(req, res, next) {
    if (req.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

module.exports = appRouteDeliveryBoy;
