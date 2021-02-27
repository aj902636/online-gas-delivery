/**
 * Created by Ajay kumar Tripathi on 10/11/2020.
 */
var mongoose = require("mongoose");
const Coupon = require('../Models/coupon');
const GasRequest = require('../Models/bookGas');
const Users = require('../Models/users');
const fs = require('fs');

const multer = require('multer');
const upload = multer({ dest: 'upload/'});

exports.bookingList = function(req, res, next) {
    var username = req.user.username;
    let profileImage = req.user.profileImage;
    var deliveryBoyList = {};
    Users.find({'role':4})
        .exec(function(err,deliveryBoy){
            if (err) {
                res.status(500).json({
                    error : err
                })
            } else {
                deliveryBoyList = deliveryBoy;
            }
        });
    GasRequest.find({'venderId':req.user._id,'status':'2'})
        .sort({ createdAt: "descending" })
        .populate('insertby', 'username')
        .populate('venderId', 'username')
        //.where('status').equals(true)
        .exec(function (err, bookingList) {
        if(err){
            res.status(500).json({error: err})
        }else{
            console.log(bookingList)
            res.render('booking',{
                bookingList: bookingList,
                username:username,
                deliveryBoyList:deliveryBoyList,
                profileImage:profileImage,
            });
        }
    });
    
};

exports.allBookingList = function(req, res, next) {
    var username = req.user.username;
    let profileImage = req.user.profileImage;
    var deliveryBoyList = {};
    Users.find({'role':4})
        .exec(function(err,deliveryBoy){
            if (err) {
                res.status(500).json({
                    error : err
                })
            } else {
                deliveryBoyList = deliveryBoy;
            }
        });
        console.log(req.user._id)
    GasRequest.find({'venderId':req.user._id})
        .sort({ createdAt: "descending" })
        .populate('insertby', 'username')
        .populate('venderId', 'username')
        //.where('status').equals(true)
        .exec(function (err, bookingList) {
        if(err){
            res.status(500).json({error: err})
        }else{
            console.log(bookingList)
            res.render('allbooking',{
                bookingList: bookingList,
                username:username,
                deliveryBoyList:deliveryBoyList,
                profileImage:profileImage,
            });
        }
    });
    
};


exports.assignDeliveryBoy = function(req, res, next){
    console.log(req.body);
    const assignDeliveryBoyArr = {
        deliveryBoyId : req.body.deliveryBoy,
        assignDeliveryBoyDate : new Date(),
    };
    console.log(assignDeliveryBoyArr)
    GasRequest.update({_id:mongoose.Types.ObjectId(req.body.assign_booking_id)}, assignDeliveryBoyArr, function(err,row){
        if(err){
            req.flash('error','Failed');
            res.redirect('/booking');
        }else{
            req.flash('success','Assign Delivery Boy SuccessFully');
            res.redirect('/booking');
        }
    });
}

exports.bookingInvoice = function(req, res, next){
    console.log(req.params.id)
    var username = req.user.username;
    let profileImage = req.user.profileImage;
    GasRequest.find({_id:mongoose.Types.ObjectId(req.params.id)})
        .sort({ createdAt: "descending" })
        .populate('insertby')   
        .populate('venderId', 'username')
        //.where('status').equals(true)
        .exec(function (err, bookingList) {
        if(err){
            res.status(500).json({error: err})
        }else{
            console.log(bookingList[0])
            res.render('invoice',{
                bookingList: bookingList[0],
                username:username,
                profileImage:profileImage,
            });
        }
    });
}







function getUserDetails(roleId,callback){
    var user = {};
    SystemModules.find()
        .where('role').equals(roleId)
        .exec(function(err, roles) {
            if (err) { return next(err); }
            console.log(user);
            callback(roles[0]);
        });
}