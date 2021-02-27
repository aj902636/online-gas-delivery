/**
 * Created by Ajay Kumar Tripathi on 01/08/2019.
 */
var mongoose = require("mongoose");
const Users = require('../../Models/users');
const bookGas = require('../../Models/bookGas');
const coupon = require('../../Models/coupon');
const cms = require('../../Models/cms');
const FAQ = require('../../Models/faq');
const Notification = require('../../Models/notification');
const BookingAmount = require('../../Models/bookingAmount');
const Rating = require('../../Models/Rating');
const savedCards = require('../../Models/savedCards');
const csv = require("fast-csv");
const fs = require('fs');
const Nexmo = require('nexmo');
const nodemailer = require('nodemailer');

const multer = require('multer');
const upload = multer({ dest: 'upload/' });
const SystemModules = require('../../Models/systemmodule');
const { connect } = require("http2");

var bcrypt = require("bcrypt-nodejs");
const { count } = require("console");
var SALT_FACTOR = 10;
var noop = function () { };




function generateOTP() {
    var digits = '0123456789';
    let OTP = "";
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return Number(OTP);
}


function sendSMSOtp(toNumber,message){
    const nexmo = new Nexmo({
        apiKey: '2ace7e17',
        apiSecret: 'K4AVoVcxP353D1hj',
    });
      
    const from = 'Vonage APIs';
    //const to = '+254 722 244486';
    const to = '+91 '+toNumber; //'+91 85458 30190';
    const text = message;//'hello ajay';
    nexmo.message.sendSms(from, to, text, function(err, responce){
        if(responce.messages[0].status == 0){
            console.log(responce);
            return true;
        }else{
            return false;
        }
    });
}

exports.register = function (req, res, next) {
    console.log("Inside userRegister");
    
    if (typeof req.file === 'undefined') {
        var useVariable = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            role: 4,
            status: true
        };
    } else {
        var useVariable = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            document: req.file.filename,
            role: 4,
            status: true
        };
    }
    console.log(useVariable);
    var newUserModel = new Users(useVariable);
    newUserModel.save()
        .then(function (doc) {
            res.status(200).json({ 'status': 'success', 'msg': 'Registration Successfully', 'data': null });
        }).catch(function (err) {
            console.log("error in catch--->", err)
            res.status(200).send({ 'status': 'error', 'msg': 'Email or Phone already exit!', 'data': null });
        });
};


exports.login = function (req, res, next) {
    let password = req.body.password;
    let username = req.body.username.trim();
    console.log("----->", req.body);
    let search;
    if (isNaN(username)) {
        search = { email: username, status: true };
    } else {
        search = { phoneNumber: username, status: true };
    }

    console.log('---->search', search);
    password = password.toString();
    Users.find(search)
        .exec(function (err, user) {
            if (err) {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something wants worng!', 'data': null });
            } else {
                console.log("User is >> ", user);
                if (user.length > 0) {
                    // console.log("pwd --->",user[0].password);
                    let isMatch = bcrypt.compareSync(password, user[0].password);
                    console.log(isMatch)
                    if (isMatch) {
                        //login
                        res.status(200).json({ 'status': 'success', 'msg': 'Login successfully', 'data': user[0] });
                    } else {
                        res.status(200).send({ 'status': 'error', 'msg': 'Worng password', 'data': null });
                    }

                    // Users.comparePassword(password, user[0].password, function (err, isMatch) {
                    //     if (err) return done(err);
                    //     console.log("isMatch-->", isMatch);
                    //     if (isMatch) {
                    //         res.status(200).json({ 'status': 'success', 'msg': 'Login successfully', 'data': user[0] });
                    //     } else {
                    //         res.status(200).send({ 'status': 'error', 'msg': 'Worng password', 'data': null });
                    //     }
                    // })
                } else {
                    res.status(200).send({ 'status': 'error', 'msg': 'Worng username', 'data': null });
                };
            };
        });
}


exports.sendOtp = function (req, res, next) {
    let username = req.body.username;
    if (isNaN(username)) {
        var search = { email: username, status: true };
    } else {
        var search = { phoneNumber: username, status: true };
    }

    
    Users.find(search)
        .exec(function (err, userData) {
            console.log(userData)
            if (err) {
                res.status(500).send({ 'status': 'error', 'msg': 'Something want worng', 'data': [] });
            } else {
                if (userData.length > 0) {
                    let otp =  generateOTP();
                    var upddata = {
                        'otp': otp,
                    }
                    Users.update({ _id: userData[0]._id }, upddata, function (err, doc) {
                        if (err) {
                            res.status(500).send({ 'status': 'error', 'msg': 'Something want worng', 'data': [] });
                        } else {
                            if (isNaN(username)) {
                                var emailMessage = 'Hello ' + userData[0].username + ' Your new OTP is ' + otp;
					
                                console.log(emailMessage);
                                var transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                    user: 'aj902636@gmail.com',
                                    pass: 'Ajaykumar@12345'
                                    }
                                });
                                
                                var mailOptions = {
                                    from: 'aj902636@gmail.com',
                                    to: username,
                                    subject: 'Send OTP',
                                    text: emailMessage
                                };
                                
                                transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                    console.log(error);
                                    } else {
                                    console.log('Email sent: ' + info.response);
                                    }
                                });
                                res.status(200).json({ 'status': 'success', 'msg': 'Send otp successfully on your email', 'data': upddata });
                            } else {
                                var massage = "Your OTP is "+otp;
                                sendSMSOtp(username,massage);
                                res.status(200).json({ 'status': 'success', 'msg': 'Send otp successfully on your mobile number', 'data': upddata });
                            }
                        }
                    })
                } else {
                    res.status(200).json({ 'status': 'error', 'msg': 'Mobile number dose not exits', 'data': null });
                }
            }
        })
}


exports.verifyOtp = function (req, res, next) { console.log(req.body)
    let username = req.body.username;
    let otp = req.body.otp;
    if (isNaN(username)) {
        var search = { email: username, otp: otp, status: true };
    } else {
        var search = { phoneNumber: username, otp: otp, status: true };
    }
    Users.find(search)
        .exec(function (err, userData) {
            
            if (err) {
                res.status(500).send({ 'status': 'error', 'msg': 'Something want worng', 'data': [] });
            } else {
                if (userData.length > 0) {
                    userData = userData[0];
                    console.log(userData)
                    if (userData.otp === Number(req.body.otp)) {
                        res.status(200).json({ 'status': 'success', 'msg': 'Verify OTP succesfully', 'data': userData });
                    } else {
                        res.status(201).json({ 'status': 'success', 'msg': 'Worng OTP', 'data': null });
                    }
                } else {
                    res.status(201).json({ 'status': 'success', 'msg': 'Worng OTP', 'data': null });
                }

            }
        });
}

exports.forgetpassword = function (req, res, next) {
    let username = req.body.username;
    if (isNaN(username)) {
        var search = { email: username, status: true };
    } else {
        var search = { phoneNumber: username, status: true };
    }
    Users.find(search)
        .exec(function (err, userData) {
            if (err) {
                res.status(500).send({ 'status': 'error', 'msg': 'Something want worng', 'data': [] });
            } else {
                //console.log(userData);
                var Variables = {
                    password: req.body.new_password,
                };
                console.log(Variables);
                bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
                    if (err) { return done(err); }
                    bcrypt.hash(req.body.new_password, salt, noop, function (err, hashedPassword) {
                        if (err) { return done(err); }
                       // done();
                        Users.password = hashedPassword;
                        console.log(Users.password)
                        var Variables = {
                            password: Users.password,
                        };
                        console.log(Variables)
                        Users.update({ _id: mongoose.Types.ObjectId(userData[0]._id) }, Variables, function (err, raw) {
                            res.status(200).json({ 'status': 'success', 'msg': 'Verify OTP Successfully', 'data': userData[0] });
                        })
                    });
                });
            }
        })
};






exports.getUserData = function (req, res, next) {
    var id = req.body.id;
    //console.log(req.body)
    Users.find()
        .sort({ createdAt: "descending" })
        .where('_id').equals(id)
        .where('status').equals(true)
        .where('role').equals('4')
        .exec(function (err, user) {
            if (!err) {
                if (user.length > 0) {
                    if (user[0].profileImage != '') {
                        user[0].profileImage = "http://" + req.headers.host + "/upload/" + user[0].profileImage;

                    }
                    res.status(200).json({ 'status': 'success', 'msg': 'Get user data Successfully', 'data': user[0] });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': user[0] });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });

}


exports.updateProfile = function (req, res, next) {
    if (typeof req.file === 'undefined') {
        var useVariable = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.mobileNumber,
            // profileImage: req.file.filename,
        };
    } else {
        var useVariable = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.mobileNumber,
            profileImage: req.file.filename,
        };
    }
    Users.update({ _id: mongoose.Types.ObjectId(req.body.user_id) }, useVariable, function (err, raw) {
        if (err) {
            res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
        } else {
            Users.find()
                .sort({ createdAt: "descending" })
                .where('_id').equals(req.body.user_id)
                .where('status').equals(true)
                .exec(function (err, user) {
                    if (!err) {
                        if (user.length > 0) {
                            if (user[0].profileImage != '') {
                                user[0].profileImage = "http://" + req.headers.host + "/upload/" + user[0].profileImage;

                            }
                            res.status(200).json({ 'status': 'success', 'msg': 'Get user data Successfully', 'data': user[0] });
                        } else {
                            res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': user[0] });
                        }
                    } else {
                        res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
                    }
                });
        }
    });

};



exports.changePassword = function(req, res, next){
    console.log('preti')
    Users.find()
        .sort({ createdAt: "descending" })
        .where('status').equals(true)
        .where('_id').equals(req.body.userId)
        .exec(function(err, userData) {
            console.log(userData)
            var Variables = {
                password : req.body.new_password,
            };//comparePassword
            Users.comparePassword(req.body.old_password,userData[0].password, function(err, ismatch){
                if(ismatch){
                    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
                        if(err) { return done(err); }
                        bcrypt.hash(req.body.new_password, salt, noop, function(err, hashedPassword) {
                            if (err) { return done(err); }
                            
                            Users.password = hashedPassword;
                            console.log(Users.password)
                            var Variables = {
                                password : Users.password,
                            };
                            console.log(Variables); 
                            Users.update({_id : mongoose.Types.ObjectId(req.body.userId)}, Variables, function(err, raw){
                                res.status(200).json({ 'status': 'success', 'msg': 'Password change successfully !', 'data': null });
                            })
                        });
                    });
                   // console.log('ajay')
                }else{ 
                    res.status(200).send({ 'status': 'error', 'msg': 'Old password is worng !', 'data': null });
                }
            })

        })
        //console.log(req.body)
}




exports.bookGas = function (req, res, next) {
    var useVariable = {
        name: req.body.name,
        registrationid: req.body.registrationid,
        address: req.body.address,
        pincode: req.body.pincode,
        amount: req.body.amount,
        venderId: mongoose.Types.ObjectId(req.body.venderId),
        insertby: mongoose.Types.ObjectId(req.body.userId)
    };
    //console.log(useVariable);
    var newBookGasModel = new bookGas(useVariable);
    newBookGasModel.save()
        .then(function (doc) {
            res.status(200).json({ 'status': 'success', 'msg': 'Booking request Successfully', 'data': null });
        }).catch(function (err) {
            res.status(200).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
        });
};

exports.upcomingBooking = function (req, res, next) {
    const deliveryBoyId = req.body.deliveryBoyId;
   
    bookGas.find()
        .sort({ createdAt: "descending" })
        .populate('venderId')
        .populate('insertby', 'username')
        .where('deliveryBoyId').equals(deliveryBoyId)
        .where('status').equals('0')
        .exec(function (err, bookingList) {
            console.log('ajay')
            console.log(bookingList)    
            if (!err) {
                if (bookingList.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Book request get data Successfully', 'data': bookingList });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': null });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });
}

exports.recentBooking = function (req, res, next) {
    const deliveryBoyId = req.body.deliveryBoyId;

    bookGas.find()
        .sort({ createdAt: "descending" })
        .populate('venderId')
        .populate('insertby', 'username')
        .where('deliveryBoyId').equals(deliveryBoyId)
        .where('status').equals('1')
        .exec(function (err, bookingList) {
            console.log('ajay')
            console.log(bookingList)    
            if (!err) {
                if (bookingList.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get recent booking data Successfully', 'data': bookingList });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': null });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });
}


exports.allBooking = function (req, res, next) {
    const deliveryBoyId = req.body.deliveryBoyId;

    bookGas.find()
        .sort({ createdAt: "descending" })
        .populate('venderId')
        .populate('insertby', 'username')
        .where('deliveryBoyId').equals(deliveryBoyId)
        //.where('status').equals('1')
        .exec(function (err, bookingList) {
            console.log('ajay')
            console.log(bookingList)    
            if (!err) {
                if (bookingList.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get all booking data Successfully', 'data': bookingList });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': null });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });
}


exports.bookingDetails = function (req, res, next) {
    const id = req.body.booking_id;
    const deliveryBoyId = req.body.deliveryBoyId;
    bookGas.find()
        .sort({ createdAt: "descending" })
        .populate('venderId','companyDetails')
        .populate('insertby', 'username')
        .where('_id').equals(id)
        .where('deliveryBoyId').equals(deliveryBoyId)
        //.where('status').equals(true)
        .exec(function (err, bookingDetails) {
            if (!err) {
                if (bookingDetails.length > 0) {
                    bookingDetails = bookingDetails[0];
                   
                    $status = '';
                    if(bookingDetails.status == '0' && bookingDetails.deliveryBoyId != null){
                        $status = 'Upcoming';
                    }else if(bookingDetails.status == '1'){
                        $status = "conform";
                    }else if(bookingDetails.status == '2'){
                        status = 'delivered';
                    }else if(bookingDetails.status == '3'){
                        status = 'Canceled';
                    }

                    bookingDetails.status = $status;
                    console.log(bookingDetails)
                    res.status(200).json({ 'status': 'success', 'msg': 'Book request get data Successfully', 'data': bookingDetails });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': null });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });
}




exports.venderRegister = function (req, res, next) {
    var useVariable = {
        username: req.body.username,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        companyDetails: req.body.companyDetails,
        password: req.body.password,
        role: 2,
        status: true
    };
    //console.log(useVariable);
    var newUserModel = new Users(useVariable);
    newUserModel.save()
        .then(function (doc) {
            res.status(200).json({ 'status': 'success', 'msg': 'Registration Successfully', 'data': null });
        }).catch(function (err) {
            console.log(err)
            res.status(500).send({ 'status': 'error', 'msg': 'Email or Phone already exit!', 'data': null });
        });
};


exports.getVenderList = function (req, res, next) {
    Users.find({}, { username: 1, _id: 1 })
        .sort({ createdAt: "descending" })
        // .where('_id').equals(id)
        .where('role', 2)
        .where('status').equals(true)
        .exec(function (err, venderData) {
            if (!err) {
                if (venderData.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get Vender data Successfully', 'data': venderData });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': venderData });
                }
            } else {
                res.status(200).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });

}


exports.getCMS = function (req, res, next) {
    var title = req.body.title;
    cms.find()
        .sort({ createdAt: "descending" })
        .where('title', title)
        .where('status').equals(true)
        .exec(function (err, cmsData) {
            if (!err) {
                if (cmsData.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get CMS data Successfully', 'data': cmsData[0] });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': cmsData });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });

}


exports.addFAQ = function (req, res, next) {
    var useVariable = {
        question: req.body.question,
        answer: req.body.answer,
    };
    //console.log(useVariable);
    var newFAQModel = new FAQ(useVariable);
    newFAQModel.save()
        .then(function (doc) {
            res.status(200).json({ 'status': 'success', 'msg': 'FAQ added Successfully', 'data': null });
        }).catch(function (err) {
            console.log(err)
            res.status(500).send({ 'status': 'error', 'msg': 'Oops something wants worng!', 'data': null });
        });
};

exports.getFAQ = function (req, res, next) {
    console.log('ajay'); 
    FAQ.find()
        .sort({ createdAt: "descending" })
        .where('status').equals(true)
        .exec(function (err, FAQData) {
            if (!err) {
                if (FAQData.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get FAQ data Successfully', 'data': FAQData });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': FAQData });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });

}

exports.addNotification = function (req, res, next) {
    var notificationArr = {
        title: 'Gas level 50%',
        message: 'Gas level 50% decress',
        insertby: mongoose.Types.ObjectId(req.body.user_id),
    }
    var newNotificationModel = new Notification(notificationArr);
    newNotificationModel.save()
        .then(function (doc) {
            res.status(200).json({ 'status': 'success', 'msg': 'Notification added Successfully', 'data': null });
        }).catch(function (err) {
            console.log(err)
            res.status(500).send({ 'status': 'error', 'msg': 'Oops something wants worng!', 'data': null });
        });
}

exports.getNotification = function (req, res, next) {
    //console.log(req.body)
    Notification.find()
        .sort({ createdAt: "descending" })
        //.where('status').equals(true)
        .where('insertby', mongoose.Types.ObjectId(req.body.user_id))
        .where('userisview', 0)
        .exec(function (err, notificationData) {
            if (!err) {
                if (notificationData.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get notification data Successfully', 'data': notificationData });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': notificationData });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something went wrongs', 'data': null });
            }
        });

}


exports.IsViewNotification = function (req, res, next) {
    //console.log(req.body);
    var upddata = {
        'userisview': 1,
    }
    Notification.update({ _id: req.body.notification_id }, upddata, function (err, doc) {
        if (err) {
            res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
        } else {
            res.status(200).json({ 'status': 'success', 'msg': 'View notificatin Successfully', 'data': null });
        }
    });
}




