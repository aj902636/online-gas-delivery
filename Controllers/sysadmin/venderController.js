/**
 * Created by Ajay kumar Tripathi on 21/10/2020.
 */
var mongoose = require("mongoose");
const User = require('../../Models/users');
const roles = require('../../Models/sysadmin/roles');
var bcrypt = require("bcrypt-nodejs");
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'upload/'});


exports.vender = function(req, res, next) {
    var username = req.user.username;
    const query_string = {role:2,isapprove:0,status: true };
    User.find(query_string,function (err,enduser) {
        getUserDetails(req.user._id, function (result) {
            if(err)res.status(500).json({error: err})
            if(req.user.role === 1){
                res.render('sysadmin/vender', {enduser: enduser});
            }else if(result.vendor === true) {
                res.render('sysadmin/vender', {enduser: enduser});
            }else if(result.vendor === false) {
                res.render('sysadmin/permission', {username: username});
            }
        });
    });
    
};

exports.existvender = function(req, res, next) {
    var username = req.user.username;
    const query_string = {role:2,isapprove:1,status: true };
    User.find(query_string,function (err,enduser) {
        getUserDetails(req.user._id, function (result) {
            if(err)res.status(500).json({error: err})
            if(req.user.role === 1){
                res.render('sysadmin/existvender', {enduser: enduser});
            }else if(result.vendor === true) {
                res.render('sysadmin/existvender', {enduser: enduser});
            }else if(result.vendor === false) {
                res.render('sysadmin/permission', {username: username});
            }
        });
       
    });
    
};



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




exports.deletevendor = function(req,res,next) {
    console.log(req.body.vendor_id)
    var redirecturl = (req.body.user == 'user')?"/sysadmin/vender":"/sysadmin/existvender";
    User.update({ _id: req.body.vendor_id},{ "status": false }, function(err, raw) {
        if(err) {
            req.flash('error','failed');
            res.redirect(redirecturl);
        }
        req.flash('success','SuccessFul');
        res.redirect(redirecturl);
    });
};

exports.ajaxEditUser = function(req, res, next) {
    var userid =  mongoose.Types.ObjectId( req.query.userid);
    console.log(userid);
    User.find()
        .where('_id').equals(userid)
        .where('status',true)
        .sort({ createdAt: "-1" })
        .exec(function(err, userData) {
            if (err) { return next(err); }
            res.status(200).json(
                userData[0]
            );
        });
};

exports.editVendor = function(req, res, next) {
    var redirecturl = (req.body.edit_type == 'user')?"/sysadmin/vender":"/sysadmin/existvender";
    const  userArr = {
        username    : req.body.username,
        email       : req.body.email,
        phoneNumber : req.body.mobile_number,
        status      : (req.body.status == 0)?"true":"false",
    };
    User.update({_id : mongoose.Types.ObjectId(req.body.id) }, userArr, function(err, raw) {
        if (err) {
            req.flash('error','failed');
            res.redirect(redirecturl);
        }
        req.flash('success','SuccessFul');
        res.redirect(redirecturl);
    });

};

exports.approvevendor = function(req, res, next){
    var user_id = req.params.id;
    const  userArr = {
        isapprove:1,
    };
    User.update({_id : mongoose.Types.ObjectId(user_id) }, userArr, function(err, raw) {
        if (err) {
            req.flash('error','failed');
            res.redirect('/sysadmin/vender');
        }
        req.flash('success','SuccessFul');
        res.redirect('/sysadmin/vender');
    });
}


function getUserDetails(roleId,callback){
    var user = {};
    roles.find()
        .where('role').equals(roleId)
        .exec(function(err, roles) {
            if (err) { return next(err); }
            console.log(user);
            callback(roles[0]);
        });
}