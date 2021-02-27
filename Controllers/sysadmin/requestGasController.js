/**
 * Created by Ajay kumar Tripathi on 10/11/2020.
 */
var mongoose = require("mongoose");
const Coupon = require('../../Models/coupon');
const GasRequest = require('../../Models/bookGas');
const Users = require('../../Models/users');
const roles = require('../../Models/sysadmin/roles');
const fs = require('fs');

const multer = require('multer');
const upload = multer({ dest: 'upload/'});

exports.bookingList = function(req, res, next) {
    var username = req.user.username;
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
    GasRequest.find({})
        .sort({ createdAt: "descending" })
        .populate('insertby', 'username')
        .populate('venderId', 'username')
        //.where('status').equals(true)
        .exec(function (err, bookingList) {
        getUserDetails(req.user._id, function (result) {
            if(err)res.status(500).json({error: err})
            if(req.user.role === 1){
                res.render('sysadmin/booking', {bookingList: bookingList,username:username,deliveryBoyList:deliveryBoyList,});
            }else if(result.requestgas === true) {
                res.render('sysadmin/booking', {bookingList: bookingList,username:username,deliveryBoyList:deliveryBoyList,});
            }else if(result.requestgas === false) {
                res.render('sysadmin/permission', {username: username});
            }
        });
    });
    
};

exports.assignDeliveryBoy = function(req, res, next){
    
    const assignDeliveryBoyArr = {
        deliveryBoyId : req.body.deliveryBoy,
        assignDeliveryBoyDate : new Date(),
        exectedDeliveryDate : req.body.expectedDeliveryDate,
    };
    
    GasRequest.update({_id:mongoose.Types.ObjectId(req.body.assign_booking_id)}, assignDeliveryBoyArr, function(err,row){
        if(err){
            req.flash('error','Failed');
            res.redirect('/sysadmin/booking');
        }else{
            req.flash('success','Assign Delivery Boy SuccessFully');
            res.redirect('/sysadmin/booking');
        }
    });
}

exports.subAdminPost = function(req, res, next){
    
    const  subAdminArr = {
        firstName  : req.body.first_name,
        secondName : req.body.last_name,
        email : req.body.email,
        username: req.body.first_name,
        phoneNumber: req.body.mobile_number,
        password:'$2a$10$6P.TsD50HcbEYY59xLqo/ugw2q3nnaD38Z/GypBaObS37NxEYnJIm',
        profileImage: req.file.filename,
        role : mongoose.Types.ObjectId(3),
        insertby: ""+req.user._id+"",
        status: (req.body.status == 0)?"true":"false",
    };
    console.log(subAdminArr);
    var sub_admin = new SubAdmin(subAdminArr);
    sub_admin.save().then(function(doc){}).catch(function (err) {
            console.log(err);
            req.flash('error','failed');
            res.redirect('/sub-admin');
        });

    req.flash('success','SuccessFul');
    res.redirect('/sub-admin');
}

exports.addCoupon = function (req, res, next) {
    //console.log(req.body)
    var useVariable = {
        coupon_name: req.body.coupon_name,
        coupon_description: req.body.coupon_description,
        coupon_code: 'COP'+generateOTP(),
        percentage: req.body.percentage,
        image: req.file.filename,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        insertby: mongoose.Types.ObjectId(req.user._id),
        status : (req.body.status)?"true":"false",
    };
    //console.log(useVariable);
    var newCouponModel = new Coupon(useVariable);
    newCouponModel.save()
        .then(function (doc) {
            req.flash('success','SuccessFul');
            res.redirect('/sysadmin/coupon');
        }).catch(function (err) {
            req.flash('error','failed');
            res.redirect('/sysadmn/coupon');
        });

}

exports.editCoupon = function(req, res, next){
    let { id } = req.body;
    console.log(req.body);
    var couponVariable = {
        coupon_name: req.body.coupon_name,
        coupon_description: req.body.coupon_description,
        percentage: req.body.percentage,
        //image: req.file.filename,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        //insertby: mongoose.Types.ObjectId(req.user._id),
        status : (req.body.status)?"true":"false",
    };
    Coupon.update({_id:mongoose.Types.ObjectId(id)}, couponVariable, function(err,row){
        if(err){
            req.flash('error','Failed');
            res.redirect('/sysadmin/coupon');
        }else{
            req.flash('success','SuccessFul');
            res.redirect('/sysadmin/coupon');
        }
    });
}

exports.deleteCoupon = function(req, res, next){
    let { couponId } = req.body;
    console.log(couponId)
    Coupon.deleteOne({_id:mongoose.Types.ObjectId(couponId)}, function(err, row){
        if(err){
            req.flash('error','Failed');
            res.redirect('/sysadmin/coupon');
        }else{
            req.flash('success','SuccessFul');
            res.redirect('/sysadmin/coupon'); 
        }
    });
}


exports.deleteSubAdmin = function(req,res,next) {
    console.log(req.body.sub_admin_id)
    SubAdmin.update({ _id: req.body.sub_admin_id},{ "status": false }, function(err, raw) {
        if (err) {
            req.flash('error','failed');
            res.redirect('/sub-admin');
        }
        req.flash('success','SuccessFul');
        res.redirect('/sub-admin');
    });
};

exports.ajaxEditCoupon = function(req, res, next) {
    var couponid =  mongoose.Types.ObjectId( req.query.couponid);
    console.log(couponid);
    Coupon.find()
        .where('_id').equals(couponid)
        .where('status',true)
        .sort({ createdAt: "-1" })
        .exec(function(err, couponData) {
            if (err) { return next(err); }
            res.status(200).json(
                couponData[0]
            );
        });
};


function getUserDetails(roleId,callback){
    var user = {};
    roles.find()
        .where('role').equals(roleId)
        .exec(function(err, roles) {
            if (err) { return next(err); }
            callback(roles[0]);
        });
}