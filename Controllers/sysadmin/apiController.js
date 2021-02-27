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
const cylinderType = require('../../Models/sysadmin/cylinderType');
const csv = require("fast-csv");
const fs = require('fs');
const Nexmo = require('nexmo');

const multer = require('multer');
const upload = multer({ dest: 'upload/' });
const SystemModules = require('../../Models/systemmodule');
const { connect } = require("http2");
const nodemailer = require('nodemailer');

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

exports.getCylinderWeight = function(req, res, next){
    cylinderType.find()
        .sort({ createdAt: "descending" })
        //.populate('insertby', 'username')
        .where('status').equals(true)
        .exec(function (err, cylinderType) {
            if (!err) {
                if (cylinderType.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get cylinder type data Successfully', 'data': cylinderType });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': null });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });
}

exports.userRegister = function (req, res, next) {
    console.log("Inside userRegister");
    var useVariable = {
        username: req.body.username,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        role: 3,
        status: true
    };
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


exports.userLogin = function (req, res, next) {
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
                        'otp' : otp,
                        'username' : username,
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


exports.verifyOtp = function (req, res, next) {
    let username = req.body.username;
    let otp = req.body.otp;
    if (isNaN(username)) {
        var search = { email: username, otp: otp, status: true };
    } else {
        var search = { phoneNumber: username, otp: otp, status: true };
    }
    Users.find()
        .exec(function (err, userData) {
            if (err) {
                res.status(500).send({ 'status': 'error', 'msg': 'Something want worng', 'data': [] });
            } else {
                if (userData.length > 0) {
                    userData = userData[0];
                    if (userData.otp === Number(req.query.otp)) {
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
                    password: req.body.password,
                };
                bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
                    if (err) { return done(err); }
                    bcrypt.hash(req.body.password, salt, noop, function (err, hashedPassword) {
                        if (err) { return done(err); }
                        //done();
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
        cylinderWeight : req.body.cylinderWeight,
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

exports.bookingList = function (req, res, next) {
    console.log(req.body)
    const id = req.body.userId;
    //console.log(id)
    bookGas.find()
        .sort({ createdAt: "descending" })
        .populate('venderId', 'username')
        .populate('insertby', 'username')
        .where('insertby').equals(id)
        //.where('status').equals(true)
        .exec(function (err, bookingList) {
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

exports.bookingDetails = function (req, res, next) {
    const id = req.body.booking_id;
    bookGas.find()
        .sort({ createdAt: "descending" })
        .populate('venderId', 'username')
        .populate('insertby', 'username')
        .where('_id').equals(id)
        //.where('status').equals(true)
        .exec(function (err, bookingDetails) {
            if (!err) {
                if (bookingDetails.length > 0) {
                    bookingDetails = bookingDetails[0];
                    console.log(bookingDetails.status);
                    //bookingDetails.status = '222';//(bookingDetails.status == 0)?"Pending":"Completed";
                    res.status(200).json({ 'status': 'success', 'msg': 'Book request get data Successfully', 'data': bookingDetails });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': null });
                }
            } else {
                res.status(500).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });
}


exports.addCoupon = function (req, res, next) {
    var useVariable = {
        coupon_name: req.body.coupon_name,
        coupon_description: req.body.coupon_description,
        coupon_code: req.body.coupon_code,
        percentage: req.body.percentage,
        image: req.file.filename,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        insertby: mongoose.Types.ObjectId(req.body.userId)
    };
    console.log(useVariable);
    var newCouponModel = new coupon(useVariable);
    newCouponModel.save()
        .then(function (doc) {
            res.status(200).json({ 'status': 'success', 'msg': 'Coupon added successfully!', 'data': null });
        }).catch(function (err) {
            res.status(200).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
        });

}


exports.getCouponList = function (req, res, next) {
    const id = req.body.userId;
    //console.log(id)
    coupon.find()
        .sort({ createdAt: "descending" })
        .populate('insertby', 'username')
        //.where('insertby').equals(id)
        .where('status').equals(true)
        .exec(function (err, couponList) {
            if (!err) {
                if (couponList.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'get coupon data Successfully', 'data': couponList });
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


exports.addCMS = function (req, res, next) {
    var useVariable = {
        title: req.body.title,
        //discription:'<p>Dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&#39;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages..</p>',
        email: req.body.email,
        mobile: req.body.mobile,
        address: req.body.address,
    };
    //console.log(useVariable);
    var newcmsModel = new cms(useVariable);
    newcmsModel.save()
        .then(function (doc) {
            res.status(200).json({ 'status': 'success', 'msg': 'CMS added Successfully', 'data': null });
        }).catch(function (err) {
            console.log(err)
            res.status(500).send({ 'status': 'error', 'msg': 'Oops something wants worng!', 'data': null });
        });
};

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

exports.addBookingAmount = function (req, res, next) {
    console.log(req.body);
    var bookingamountArr = {
        amount: req.body.amount,
        insertby: mongoose.Types.ObjectId(req.body.vender_id),
    }
    var bookingAmountModel = new BookingAmount(bookingamountArr);
    bookingAmountModel.save()
        .then(function (doc) {
            res.status(200).json({ 'status': 'success', 'msg': 'Booking amount added Successfully', 'data': null });
        }).catch(function (err) {
            console.log(err)
            res.status(500).send({ 'status': 'error', 'msg': 'Oops something wants worng!', 'data': null });
        });
}

exports.getBookingAmount = function (req, res, next) {
    BookingAmount.find()
        .sort({ createdAt: "descending" })
        .where('status').equals(true)
        .where('insertby', mongoose.Types.ObjectId(req.body.vender_id))
        .where('cylinderWeight',req.body.cylinderWeight)
        .exec(function (err, bookingAmountData) {
            if (!err) {
                if (bookingAmountData.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get booking amount data Successfully', 'data': bookingAmountData[0] });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'No data Found !', 'data': null });
                }
            } else {
                res.status(200).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });
}

exports.postRating = function (req, res, next) {
    console.log(req.body);
    let { user_id, booking_id, rating } = req.body;
    let comments = req.body.comments;

    comments = comments.length > 1 ? comments : " ";
    rating = parseInt(rating)

    if (!user_id || !booking_id) {
        return res.status(200).json({ 'status': 'wrong parameters', 'msg': 'All Fields must required', 'data': null });
    }

    let rateObj = {
        user_id: user_id,
        booking_id: booking_id,
        Rating: rating,
        Comments: comments
    }

    //    return res.send(rateObj);
    let RatingModel = new Rating(rateObj);
    RatingModel.save()
        .then((doc) => {
            console.log("Inside catch of rate --->", doc)
            res.status(200).json({ 'status': 'success', 'msg': 'Rating Successfull', 'data': doc })
        }).catch(err => {
            // console.log("Inside Err of rate --->", err);
            res.status(500).send({ 'status': 'error', 'msg': 'Oops something wants worng!', 'data': null });
        })
}

exports.postSavedCards = (req, res, next) => {
    let { user_id, card_number, exp_month, exp_year, CVV } = req.body;
    console.log("req Body --->", req.body)

    if (!card_number || !exp_month || !exp_year || !CVV) {
        res.status(400).send({ 'status': 'Wrong data', 'msg': 'Wrong data', 'data': null });
        // user_id = user_id.toString.trim();
        card_number = card_number.toString().trim()
        console.log("-->card", card_number, typeof card_number);

        CVV = parseInt(CVV.toString().trim())
        console.log("--->CVV", CVV)

        exp_month = parseInt(exp_month.toString().trim())
        exp_year = parseInt(exp_year.toString().trim())

    }
    let cardDetails = {
        user_id: user_id,
        card_number: card_number,
        expiry: {
            month: exp_month,
            year: exp_year
        },
        CVV: CVV
    }

    let savedCard = new savedCards(cardDetails);
    savedCard.save()
        .then((doc) => {
            // console.log("Inside catch of saveCard --->", doc)
            res.status(200).json({ 'status': 'success', 'msg': 'Card Saved Successfully', 'data': doc })
        }).catch(err => {
            console.log("Inside Err of saveCard --->", err);
            res.status(500).send({ 'status': 'error', 'msg': 'Oops something went worng!', 'data': null });
        })
}

exports.getSavedCardsDetails = async (req, res, next) => {
    let { user_id } = req.body;
    if (!user_id) {
        res.status(400).send({ 'status': 'error', 'msg': 'Wrong data', 'data': null });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
    }
    try {
        // let thisUserCards = await savedCards.find({}).select({"_id ": 1, "user_id": 1, "card_number": 1, "CVV": 1, "expiry": 1});
        let thisUserCards = await savedCards.find({})
        let lastInsertedCard = thisUserCards[thisUserCards.length-1]
        // thisUserCards.pop()
        // lastInsertedCard.default = true;
        // thisUserCards.push(lastInsertedCard);
        // console.log("------>", thisUserCards[thisUserCards.length-1])
        if(thisUserCards.length > 0){
            res.status(200).json({ 'status': 'success', 'msg': 'Cards get  Successfully', 'data': thisUserCards })
        }else{
            res.status(400).send({ 'status': 'error', 'msg': 'Wrong data', 'data': null });
        }

    } catch (err) {
        console.log("err ---->", err)
        res.status(500).send({ 'status': 'error', 'msg': 'Oops something went worng!', 'data': null });
    }                                                                                                                                                                                                           
}

exports.applyCoupon = function(req, res, next){
    let { coupon_code } = req.body;
    let { amount } = req.body;
    coupon.find({},{percentage:1})
        .sort({ createdAt: "descending" })
        .where('status').equals(true)
        .where('coupon_code',).equals(coupon_code)
        .limit(1)
        .exec(function (err, couponData) {
            if(!err){
                var new_array = [];
                let discount_amt = (amount*couponData[0].percentage/100);
                let discounted_amt = amount - discount_amt;
                new_array.push({'_id':couponData[0]._id,'cupon_code':coupon_code,'percentage':couponData[0].percentage,'discount_amt':discount_amt,'amount':discounted_amt,'total_amount':amount});
                if (couponData.length > 0) {
                    res.status(200).json({ 'status': 'success', 'msg': 'Get apply coupon amount', 'data': new_array[0] });
                } else {
                    res.status(200).json({ 'status': 'success', 'msg': 'Invalid coupon !', 'data': null });
                }
            } else {
                res.status(200).send({ 'status': 'error', 'msg': 'Oops something want worngs', 'data': null });
            }
        });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
}


