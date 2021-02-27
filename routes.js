/**
 * Created by Ajay Kumar Tripathi on 26/09/2020.
 */
const request = require('request')
const sysadminapiController = require('./Controllers/sysadmin/apiController');
const loginController = require('./Controllers/loginController');
const sysadminHomeController = require('./Controllers/sysadmin/homeController');
const endUserController = require('./Controllers/sysadmin/endUserController');
const venderController = require('./Controllers/sysadmin/venderController');
const dashboardController = require('./Controllers/dashboardControllers');
const couponController = require('./Controllers/sysadmin/couponControllers')
const bookingAmountController = require('./Controllers/BookingAmountController');
const subAdminController = require('./Controllers/sysadmin/subAdmin');
const requestGasContoller = require('./Controllers/sysadmin/requestGasController');
const bookingGasController = require('./Controllers/bokingGasController');
const upcomingBookingController = require('./Controllers/upcomingBookingController');
const sysAdminRolesController = require('./Controllers/sysadmin/rolesController');
const cylinderTypeController = require('./Controllers/sysadmin/cylinderTypeController');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var Users = require('./Models/users');
const appRoute = express.Router();

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
appRoute.get('/login', loginController.login);
appRoute.get('', loginController.login,function (req, res) {
    res.redirect('/login');
});
appRoute.post('/login',
    passport.authenticate('local', {
        failureFlash: 'Username or Password is Incorrect', // req.flash('error','Failed check your credentials');
        failureRedirect: '/login'
    }), function (req, res) { //console.log(req);
        //req.flash('success','you are now Logged In');
        res.locals.user = req.user;
        console.log(req.user);
        if(req.user.role == 2) {
            res.redirect('/dashboard');
        } else {
            res.redirect('sysadmin/dashboard');
        }
    });
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    Users.getUserById(id, function (err, user) {
        done(err, user);
    });
});
passport.use(new LocalStrategy(function (username, password, done) {
    Users.getUserByUsername(username, function (err, user) {
        // console.log(user)
        if (err) throw err;
        if (!user) {
            return done(null, false, { message: 'Unknown User..' });
        }
        Users.comparePassword(password, user.password, function (err, isMatch) {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Invalid Password' })
            }
        })
    });
}));

appRoute.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});





/**
 *  Home ROUTES
 */
//appRoute.get('/',requiresLogin,homeController.dashboard);
//appRoute.get('/test',requiresLogin,homeController.testing);
//appRoute.get('/dashboard',requiresLogin,homeController.dashboard);

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


appRoute.get('/sysadmin/cylinderType', requiresLogin,cylinderTypeController.listing);
appRoute.post('/sysadmin/addCylinderType',requiresLogin,cylinderTypeController.addCylinderType);
appRoute.post('/sysadmin/cylinderTypeDelete',requiresLogin,cylinderTypeController.cylinderTypeDelete);

appRoute.get('/sysadmin/subadmin',requiresLogin,subAdminController.listing);
appRoute.post('/sysadmin/subadmin',requiresLogin,upload.single('file'),subAdminController.subAdminPost);
appRoute.get('/sysadmin/ajaxEditSubAdmin', requiresLogin, subAdminController.ajaxEditSubAdmin);
appRoute.post('/sysadmin/editSubAdmin',requiresLogin,upload.single('file'),subAdminController.editSubAdmin);
appRoute.post('/sysadmin/subAdminDelete',requiresLogin,subAdminController.subAdminDelete);

appRoute.get('/sysadmin/booking',requiresLogin,requestGasContoller.bookingList);
appRoute.post('/sysadmin/assignDeliveryBoy', requiresLogin,requestGasContoller.assignDeliveryBoy);

//appRoute.get('/bookingAmountAjax', requiresLogin,bookingAmountController.bookingAmountAjax);
//appRoute.post('/editBookingAmount',requiresLogin,bookingAmountController.editBookingAmount);


appRoute.get('/booking',requiresLogin,bookingGasController.bookingList);
appRoute.post('/assignDeliveryBoy', requiresLogin, bookingGasController.assignDeliveryBoy);
appRoute.get('/bookingInvoice:id', requiresLogin, bookingGasController.bookingInvoice);


appRoute.get('/upcomingBooking',requiresLogin,upcomingBookingController.upcomingBookingList);

appRoute.get('/allBooking',requiresLogin,bookingGasController.allBookingList);
//appRoute.post('/import',requiresLogin,wauminiController.importCsv);
//appRoute.post('/import',requiresLogin,upload.single('file'),wauminiController.importCsv);

/************************************************************************************/
//                           MOBILE APPLICATION API
/***********************************************************************************/
/**
 *  Registration
 */
    appRoute.get('/register', loginController.register);
    appRoute.post('/register',loginController.registerServiceProvider)

/**
 * End Registration  
 */ 


/*start Admin role routing here*/
appRoute.get('/sysadmin/roles:id', requiresLogin, sysAdminRolesController.adminRole);
    //appRoute.get('/sysadmin/createRoles',requiresLogin,sysAdminSubAdminubController.createRoles);

/*end sub-admin panel role routing*/
    

/*start admin role routing here*/
appRoute.get('/sysadmin/dashboardClick',requiresLogin,sysAdminRolesController.dashboardClick);
appRoute.get('/sysadmin/subAdminClick', requiresLogin,sysAdminRolesController.SubAdminClick)
appRoute.get('/sysadmin/userClick', requiresLogin, sysAdminRolesController.userClick)
appRoute.get('/sysadmin/vendorClick',requiresLogin, sysAdminRolesController.vendorClick);
appRoute.get('/sysadmin/couponClick',requiresLogin,sysAdminRolesController.couponClick);
appRoute.get('/sysadmin/requestGasClick',requiresLogin,sysAdminRolesController.requestGasClick);
//appRoute.get('/sysadmin/broadcastClick',requiresLogin,sysAdminRolesController.broadcastClick);
//appRoute.get('/sysadmin/reportsClick',requiresLogin,sysAdminRolesController.reportsClick);
/*End sub admin role routing here*/

 
 
 
    /**
  * start routing for service provider
 */
    appRoute.get('/dashboard',requiresLogin,dashboardController.dashboard);
    appRoute.get('/profile',requiresLogin, dashboardController.profile);
    appRoute.post('/profile',requiresLogin, upload.single('profile_image'), dashboardController.updateProfile);
    appRoute.get('/changePassword', requiresLogin, dashboardController.changePassword);
    appRoute.post('/changePassword', dashboardController.changeVenderPassword);


    appRoute.get('/bookingAmount',requiresLogin,bookingAmountController.getBookingAmount);
    appRoute.get('/bookingAmountAjax', requiresLogin,bookingAmountController.bookingAmountAjax);
    appRoute.post('/editBookingAmount',requiresLogin,bookingAmountController.editBookingAmount);
    appRoute.post('/addBookingAmount', requiresLogin,bookingAmountController.addBookingAmount);
 /**
  * End routing for service provider 
 */

/*start admin routing here*/
appRoute.get('/sysadmin/', requiresLogin, sysadminHomeController.dashboard);
appRoute.get('/sysadmin/dashboard', requiresLogin, sysadminHomeController.dashboard);
appRoute.get('/sysadmin/sys-admin-profile',requiresLogin,sysadminHomeController.profile)
appRoute.post('/sysadmin/profile',requiresLogin, upload.single('profile_image'), sysadminHomeController.updateProfile);
appRoute.get('/sysadmin/changePassword',requiresLogin,sysadminHomeController.changePassword)
appRoute.post('/sysadmin/changeAdminPassword',requiresLogin,sysadminHomeController.changeAdminPassword)

/*start coupon module routing here*/
appRoute.get('/sysadmin/coupon', requiresLogin, couponController.coupon);
appRoute.post('/sysadmin/addCoupon', requiresLogin, upload.single('image'), couponController.addCoupon);
appRoute.get('/sysadmin/ajaxEditCoupon', requiresLogin, couponController.ajaxEditCoupon);
appRoute.post('/sysadmin/editCoupon', requiresLogin, upload.single('image'),couponController.editCoupon);
//appRoute.get('/sysadmin/approveuser:id', requiresLogin, endUserController.approveuser);
/*end coupon module routing here*/

/*end admin routing here*/


/*sysadmin routing start here*/
appRoute.get('/sysadmin/user', requiresLogin, endUserController.user);
appRoute.get('/sysadmin/ajaxEditUser', requiresLogin, endUserController.ajaxEditUser);
appRoute.post('/sysadmin/editUser', requiresLogin, endUserController.editUser);
appRoute.get('/sysadmin/approveuser:id', requiresLogin, endUserController.approveuser);

appRoute.get('/sysadmin/existuser', requiresLogin, endUserController.existuser);


appRoute.get('/sysadmin/vender', requiresLogin, venderController.vender);
appRoute.get('/sysadmin/existvender', requiresLogin, venderController.existvender);
appRoute.get('/sysadmin/approvevendor:id', requiresLogin, venderController.approvevendor);
appRoute.post('/sysadmin/editVendor', requiresLogin, venderController.editVendor);
appRoute.post('/sysadmin/deletevendor',requiresLogin,venderController.deletevendor);

/*sysadmin routing end here */


/*New API Author by Ajay Kumar Tripathi*/
appRoute.post('/api/getUserData', sysadminapiController.getUserData);
appRoute.post('/api/updateProfile', upload.single('profile_image'), sysadminapiController.updateProfile);
appRoute.post('/api/changePassword',sysadminapiController.changePassword);
//appRoute.post('/api/updateProfile',sysadminapiController.updateProfile);


appRoute.post('/api/userRegister', sysadminapiController.userRegister);
appRoute.post('/api/userLogin', sysadminapiController.userLogin);
appRoute.post('/api/sendOtp', sysadminapiController.sendOtp);
appRoute.get('/api/verifyOtp', sysadminapiController.verifyOtp);
appRoute.post('/api/forgetpassword', sysadminapiController.forgetpassword);
appRoute.post('/api/bookGas', sysadminapiController.bookGas);
appRoute.post('/api/bookingList', sysadminapiController.bookingList);
appRoute.post('/api/bookingDetails', sysadminapiController.bookingDetails);

appRoute.post('/api/addCoupon', upload.single('image'), sysadminapiController.addCoupon);
appRoute.post('/api/getCouponList', sysadminapiController.getCouponList);

appRoute.post('/api/venderRegister', sysadminapiController.venderRegister);
appRoute.post('/api/getVenderList', sysadminapiController.getVenderList);
appRoute.post('/api/getCylinderWeight',sysadminapiController.getCylinderWeight);


appRoute.post('/api/addCMS', sysadminapiController.addCMS);
appRoute.post('/api/getCMS', sysadminapiController.getCMS);

appRoute.post('/api/addFAQ', sysadminapiController.addFAQ);
appRoute.post('/api/getFAQ', sysadminapiController.getFAQ);

appRoute.post('/api/addNotification', sysadminapiController.addNotification);
appRoute.post('/api/getNotification', sysadminapiController.getNotification);
appRoute.post('/api/IsViewNotification', sysadminapiController.IsViewNotification);

appRoute.post('/api/addBookingAmount', sysadminapiController.addBookingAmount);
appRoute.post('/api/getBookingAmount', sysadminapiController.getBookingAmount);

appRoute.post('/api/rating', sysadminapiController.postRating);

appRoute.post('/api/saveCardDetails', sysadminapiController.postSavedCards);
appRoute.post('/api/getSaveCardDetails', sysadminapiController.getSavedCardsDetails);
appRoute.post('/api/applyCoupon', sysadminapiController.applyCoupon);




const urls = {
    'stk': "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    "simulate": "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate",
    "b2c": "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
    "base_url": "http://182.76.237.236:3000"
}
const maker = access_token()
const headers = {
    "Authorization": "Bearer " + maker
}


appRoute.get('/testmpasa', (req, res) => {
    let date = new Date()
    let timestamp = date.getDate() + "" + "" + date.getMonth() + "" + "" + date.getFullYear() + "" + "" + date.getHours() + "" + "" + date.getMinutes() + "" + "" + date.getSeconds()

    res.status(200).json({ message: "We're up and running. Happy Coding", time: new Buffer.from(timestamp).toString('base64'), token: headers })
})

appRoute.get('/access_token', access, (req, res) => {
    res.status(200).json({ access_token: req.access_token });
})



appRoute.get('/registermpesa', access, (req, resp) => { 
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "ShortCode": "603085",
                "ResponseType": "Complete",
                "ConfirmationURL": "http://182.76.237.236:3000/confirmation",
                "ValidationURL": "http://182.76.237.236:3000/validation"
            }
        },
        function (error, response, body) {
            if (error) { console.log(error) }
            resp.status(200).json(body)
        }
    )
})

appRoute.post('/confirmation', (req, res) => {
    console.log('....................... confirmation .............')
    console.log(req.body)
})

appRoute.post('/validation', (req, resp) => {
    console.log('....................... validation .............')
    console.log(req.body)
})


appRoute.get('/simulate', access, (req, res) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "ShortCode": "603085",
                "CommandID": "CustomerPayBillOnline",
                "Amount": "100",
                "Msisdn": "254708374149",
                "BillRefNumber": "TestAPI"
            }
        },
        function (error, response, body) {
            if (error) {
                console.log(error)
            }
            else {
                res.status(200).json(body)
            }
        }
    )
})

appRoute.get('/balance', access, (req, resp) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "Initiator": "apitest342",
                "SecurityCredential": "5PW7nppk",
                "CommandID": "AccountBalance",
                "PartyA": "603085",
                "IdentifierType": "4",
                "Remarks": "bal",
                "QueueTimeOutURL": "http://182.76.237.236:3000/bal_timeout",
                "ResultURL": "http://182.76.237.236:3000/bal_result"
            }
        },
        function (error, response, body) {
            if (error) {
                console.log(error)
            }
            else {
                resp.status(200).json(body)
            }
        }
    )
})

appRoute.get('/stk', access, (req, res) => {
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        auth = "Bearer " + req.access_token
    let date = new Date()
    const timestamp = date.getFullYear() + "" + "" + date.getMonth() + "" + "" + date.getDate() + "" + "" + date.getHours() + "" + "" + date.getMinutes() + "" + "" + date.getSeconds()
    const password = new Buffer.from('174379' + 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919' + timestamp).toString('base64')

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "BusinessShortCode": "174379",
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "1",
                "PartyA": "254716437799",
                "PartyB": "174379",
                "PhoneNumber": "254716437799",
                "CallBackURL": "http://182.76.237.236:3000/stk_callback",
                "AccountReference": "Test",
                "TransactionDesc": "TestPay"
            }
        },
        function (error, response, body) {
            if (error) {
                console.log(error)
            }
            else {
                res.status(200).json(body)
            }
        }
    )
})

appRoute.get('/b2c', access, (req, res) => {
    const url = 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
        auth = 'Bearer ' + req.access_token

    request({
        method: "POST",
        url: url,
        headers: {
            "Authorization": auth
        },
        json: {
            "InitiatorName": "apitest342",
            "SecurityCredential": "Q9KEnwDV/V1LmUrZHNunN40AwAw30jHMfpdTACiV9j+JofwZu0G5qrcPzxul+6nocE++U6ghFEL0E/5z/JNTWZ/pD9oAxCxOik/98IYPp+elSMMO/c/370Joh2XwkYCO5Za9dytVmlapmha5JzanJrqtFX8Vez5nDBC4LEjmgwa/+5MvL+WEBzjV4I6GNeP6hz23J+H43TjTTboeyg8JluL9myaGz68dWM7dCyd5/1QY0BqEiQSQF/W6UrXbOcK9Ac65V0+1+ptQJvreQznAosCjyUjACj35e890toDeq37RFeinM3++VFJqeD5bf5mx5FoJI/Ps0MlydwEeMo/InA==",
            "CommandID": "BusinessPayment",
            "Amount": "200",
            "PartyA": "601342",
            "PartyB": "254708374149",
            "Remarks": "please pay",
            "QueueTimeOutURL": "http://182.76.237.236:3000/b2c_timeout_url",
            "ResultURL": "http://182.76.237.236:3000/b2c_result_url",
            "Occasion": "endmonth"
        }
    },
        function (error, response, body) {
            if (error) {
                console.log(error)
            }
            else {
                res.status(200).json(body)
            }
        }
    )
})

appRoute.get('/reverse', access, (req, res) => {
    const url = 'https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request',
        auth = 'Bearer ' + req.access_token

        request({
            method: "POST",
            url: url,
            headers: {
                "Authorization": auth
            },
            json: {
                "Initiator": "apitest342",
                "SecurityCredential":"Q9KEnwDV/V1LmUrZHNunN40AwAw30jHMfpdTACiV9j+JofwZu0G5qrcPzxul+6nocE++U6ghFEL0E/5z/JNTWZ/pD9oAxCxOik/98IYPp+elSMMO/c/370Joh2XwkYCO5Za9dytVmlapmha5JzanJrqtFX8Vez5nDBC4LEjmgwa/+5MvL+WEBzjV4I6GNeP6hz23J+H43TjTTboeyg8JluL9myaGz68dWM7dCyd5/1QY0BqEiQSQF/W6UrXbOcK9Ac65V0+1+ptQJvreQznAosCjyUjACj35e890toDeq37RFeinM3++VFJqeD5bf5mx5FoJI/Ps0MlydwEeMo/InA==",
                "CommandID":"TransactionReversal",
                "TransactionID":"NLJ11HAY8V",
                "Amount":"100",
                "ReceiverParty":"601342",
                "RecieverIdentifierType":"11",
                "ResultURL":"http://182.76.237.236:3000/reverse_result_url",
                "QueueTimeOutURL":"http://182.76.237.236:3000/reverse_timeout_url",
                "Remarks":"Wrong Num",
                "Occasion":"sent wrongly"
            }
        },
            function (error, response, body) {
                if (error) {
                    console.log(error)
                }
                else {
                    res.status(200).json(body)
                }
            }
        )
})

appRoute.post('/reverse_result_url', (req, res) => {
    console.log("--------------------Reverse Result -----------------")
    console.log(JSON.stringify(req.body.Result.ResultParameters))
})

appRoute.post('/reverse_timeout_url', (req, res) => {
    console.log("-------------------- Reverse Timeout -----------------")
    console.log(req.body)
})

appRoute.post('/b2c_result_url', (req, res) => {
    console.log("-------------------- B2C Result -----------------")
    console.log(JSON.stringify(req.body.Result))
})

appRoute.post('/b2c_timeout_url', (req, res) => {
    console.log("-------------------- B2C Timeout -----------------")
    console.log(req.body)
})

appRoute.post('/stk_callback', (req, res) => {
    console.log('.......... STK Callback ..................')
    console.log(JSON.stringify(req.body.Body.stkCallback))
})

appRoute.post('/bal_result', (req, resp) => {
    console.log('.......... Account Balance ..................')
    console.log(req.body)
})

appRoute.post('/bal_timeout', (req, resp) => {
    console.log('.......... Timeout..................')
    console.log(req.body)
})

function access(req, res, next) {
    // access token
    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer.from("p3bhyyVNH84F4hPdSBIAlqZ1QwoMAsDD:YQGHlyEnNvF1vmJ6").toString('base64');

    request(
        {
            url: url,
            headers: {
                "Authorization": "Basic " + auth
            }
        },
        (error, response, body) => {
            if (error) {
                console.log(error)
            }
            else {
                // let resp =
                req.access_token = JSON.parse(body).access_token
                next()
            }
        }
    )
}


function access_token() {
    // access token
    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer.from("X3mEA1CXCQjWZdglUDDsnT3o9Jz1fQYf:COcAbnHNOYAUMJ4E").toString('base64');

    request(
        {
            url: url,
            headers: {
                "Authorization": "Basic " + auth
            }
        },
        (error, response, body) => {
            if (error) {
                console.log(error)
            }
            else {
                // let resp =
               return JSON.parse(body).access_token;
            }
        }
    )
}




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

module.exports = appRoute;
