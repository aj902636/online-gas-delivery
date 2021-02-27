/**
 * Created by Emman on 01/08/2019.
 */
const Matangazo = require('../Models/matangazo');
const Category = require('../Models/categories');
const SystemModules = require('../Models/systemmodule');
var mongoose = require("mongoose");
const SubAdmin = require('../Models/users');
const sub_admin = require('../Models/subAdmin');
var bcrypt = require("bcrypt-nodejs");
const fs = require('fs');

const multer = require('multer');
const upload = multer({ dest: 'upload/'});


exports.translate = function(req, res, next){
    res.render('translate');
}

exports.listing = function(req, res, next) {
    var username = req.user.firstName+ " "+ req.user.secondName ;
    var subadmin = {};
    const query_string = { status: true };
    SubAdmin.find(query_string,function (err,subadmin) {
        //console.log(subadmin)
        if(err){
            console.log(err);
            res.status(500).json({
                error: err
            })
        }else{
            subadmin = subadmin;
            res.render('subAdmin', {subadmin: subadmin});
        }
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
exports.ajaxeditsubadmin = function(req, res, next) {

    var subAdminId =  mongoose.Types.ObjectId( req.query.subAdminId);
    console.log(subAdminId);
    SubAdmin.find()
        .where('_id').equals(subAdminId)
        .where('status',true)
        .sort({ createdAt: "-1" })
        .exec(function(err, subadmin) {
            if (err) { return next(err); }
            res.status(200).json(
                subadmin[0]
            );
        });
};
exports.editSubAdmin = function(req, res, next) {

    console.log(req.file);
    const  subAdminArr = {
        firstName  : req.body.first_name,
        secondName : req.body.last_name,
        email : req.body.email,
        username: req.body.first_name,
        phoneNumber: req.body.mobile_number,
        profileImage: req.file.filename,
        //password:'$2a$10$6P.TsD50HcbEYY59xLqo/ugw2q3nnaD38Z/GypBaObS37NxEYnJIm',
        role : mongoose.Types.ObjectId(3),
        //insertby: ""+req.user._id+"",
        status: (req.body.status == 0)?"true":"false",
    };
    SubAdmin.update({_id : mongoose.Types.ObjectId(req.body.id) }, subAdminArr, function(err, raw) {
        if (err) {
            req.flash('error','failed');
            res.redirect('/sub-admin');
        }
        req.flash('success','SuccessFul');
        res.redirect('/sub-admin');
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