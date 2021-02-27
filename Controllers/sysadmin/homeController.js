/**
 * Created by Emman on 01/08/2019.
 */

var mongoose = require("mongoose");
const Users = require('../../Models/users');
const SystemModules = require('../../Models/systemmodule');

var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;
var noop = function() {};
    
exports.dashboard = function(req, res, next) {
    var username = req.user.username;
    console.log(req.user)
    console.log(username);
    res.render('sysadmin/dashboard',{
        username:username,
        
    });
};

exports.profile = function(req, res , next){
    let username = req.username;
    let profileImage = req.user.profileImage;
    console.log(profileImage)
    let id = req.user._id
    Users.findOne({})
    .where('_id').equals(id)
    .exec(function(err, userData){
        if(err){
            res.status(500).json({error: err})
        }else{
            res.render('sysadmin/adminProfile',{userData:userData,username:username,profileImage:profileImage});
        }
    })
};

exports.changePassword = (req, res, next)=>{
    let username = req.username;
    let profileImage = req.user.profileImage;
    res.render('sysadmin/changePassword',{username:username,profileImage:profileImage});
}

exports.changeAdminPassword = function(req, res, next){
    Users.find()
        .sort({ createdAt: "descending" })
        .where('status').equals(true)
        .where('_id').equals(req.user._id)
        .exec(function(err, userData) {
            console.log(userData)
            var Variables = {
                password : req.body.pwd1,
            };//comparePassword
            Users.comparePassword(req.body.old_password,userData[0].password, function(err, ismatch){
                if(ismatch){
                    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
                        if(err) { return done(err); }
                        bcrypt.hash(req.body.pwd1, salt, noop, function(err, hashedPassword) {
                            if (err) { return done(err); }
                            
                            Users.password = hashedPassword;
                            console.log(Users.password)
                            var Variables = {
                                password : Users.password,
                            };
                            console.log(Variables); 
                            Users.update({_id : mongoose.Types.ObjectId(req.user._id)}, Variables, function(err, raw){
                                req.flash('success','Password change successfully !');
                                res.redirect('/changePassword'); 
                            })
                        });
                    });
                   // console.log('ajay')
                }else{
                    req.flash('error','Old password is worng !');
                    res.redirect('/changePassword'); 
                }
            })

        })
        //console.log(req.body)
}


exports.updateProfile = function(req, res, next){
    
    if(typeof req.file === 'undefined'){
         var updateProfileVar = {
             username : req.body.username,
             email: req.body.email,
             phoneNumber: req.body.phoneNumber,
             //companyDetails: req.body.companyDetails,
         }
     }else{
         var updateProfileVar = {
             username : req.body.username,
             email: req.body.email,
             phoneNumber: req.body.phoneNumber,
            // companyDetails: req.body.companyDetails,
             profileImage : req.file.filename,
         }
     }
    Users.update({_id:mongoose.Types.ObjectId(req.user._id)},updateProfileVar,(err,result)=>{
        if(err){
             req.flash('failed','Error')
             res.redirect('/sysadmin/sys-admin-profile')
        }else{
             req.flash('success','SuccessFul');
             res.redirect('/sysadmin/sys-admin-profile');
        }
    })
 }

function getUserDetails(roleId,callback){
    var user = {};
    SystemModules.find()
        .where('role').equals(roleId)
        .exec(function(err, roles) {
            if (err) { return next(err); }
            console.log(user);
            callback(roles[0]);
        })
    
}
