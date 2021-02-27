/**
 * Created by Ajay kumar Tripathi on 18/11/2020.
 */
var mongoose = require("mongoose");
const BookingAmount = require('../Models/bookingAmount');
var bcrypt = require("bcrypt-nodejs");
const fs = require('fs');

exports.getBookingAmount = function(req, res, next) {
    var username = req.user.username;
    let profileImage = req.user.profileImage;
    BookingAmount.find()
        .sort({ createdAt: "descending" })
        .populate('insertby', 'username')
        .where('insertby').equals(req.user._id)
        //.where('status').equals(true)
        .exec(function (err, bookingAmountList) {
        if(err){
            res.status(500).json({error: err})
        }else{
            let arraysize = (bookingAmountList.length == 0)?true:false;
            res.render('bookingAmount', {bookingAmountList: bookingAmountList,username:username, profileImage:profileImage,arraysize:arraysize});
        }
    });
    
};



exports.addBookingAmount = function (req, res, next) {
    console.log(req.body)
    var useVariable = {
        amount: req.body.bookingAmount,
        cylinderWeight : req.body.cylinderWeight,
        insertby: mongoose.Types.ObjectId(req.user._id),
        status : (req.body.status =='0')?"true":"false",
    };
    console.log(useVariable);
    var newBookingAmountModel = new BookingAmount(useVariable);
    newBookingAmountModel.save()
        .then(function (doc) {
            req.flash('success','SuccessFul');
            res.redirect('/bookingAmount');
        }).catch(function (err) {
            console.log(err)
            req.flash('error','failed');
            res.redirect('/bookingAmount');
        });

}

exports.editBookingAmount = function(req, res, next){
    let { id } = req.body;
    console.log(req.body)
    var bookingAmountVariable = {
        amount: req.body.bookingAmount,
        cylinderWeight : req.body.cylinderWeight,
        insertby: mongoose.Types.ObjectId(req.user._id),
        status : (req.body.status == 0)?"true":"false",
    };
    console.log(bookingAmountVariable)
    BookingAmount.update({_id:mongoose.Types.ObjectId(id)}, bookingAmountVariable, function(err,row){
        if(err){
            req.flash('error','Failed');
            res.redirect('/bookingAmount');
        }else{
            req.flash('success','SuccessFul');
            res.redirect('/bookingAmount');
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

exports.bookingAmountAjax = function(req, res, next) {
    var bookingAmountid =  mongoose.Types.ObjectId( req.query.bookingAmountid);
    console.log(bookingAmountid);
    BookingAmount.find()
        .where('_id').equals(bookingAmountid)
        //.where('status',true)
        .sort({ createdAt: "-1" })
        .exec(function(err, BookingAmountData) {
            if (err) { return next(err); }
            res.status(200).json(
                BookingAmountData[0]
            );
        });
};


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