/**
 * Created by Emman on 01/08/2019.
 */
const Users = require('../../Models/users');
//const UsersCategory = require('../../Models/userscategory');
const SystemModules = require('../../Models/systemmodule');
const roles = require('../../Models/sysadmin/roles');
var mongoose = require("mongoose");

exports.listing = function(req , res , next){
    var username = req.user.username;
    var usercat = {};
    Users.find()
        .sort({ createdAt: "descending" })
        //.populate('role')
        .where('role').equals(5)
        .where('status').equals(true)
        .exec(function(err, subAdmin) {
            getUserDetails(req.user._id, function (result) {
                if(err)res.status(500).json({error: err})
                if(req.user.role === 1){
                    res.render("sysadmin/subadmin", {subAdmin: subAdmin, username: username});
                }else if(result.subAdmin === true) {
                    res.render("sysadmin/subadmin", {subAdmin: subAdmin, username: username});
                }else if(result.subAdmin === false) {
                    res.render('sysadmin/permission', {username: username});
                }
            });
            
        });
};
exports.subAdminPost = function(req, res, next) {
    if(typeof req.file === 'undefined') {
        var useVariable = {
            username: req.body.username,
            email:req.body.email,
            phoneNumber : req.body.phonenumber,
            password: req.body.password,
            insertby: req.user._id,
            role: 5,
            status : true
        };
    }else{
        var useVariable = {
            username: req.body.username,
            email:req.body.email,
            phoneNumber : req.body.phonenumber,
            profileImage: req.file.filename,
            password: req.body.password,
            insertby: req.user._id,
            role: 5,
            status : true
        };
    }
    //console.log(useVariable)
    var newUserModel = new Users(useVariable);
    newUserModel.save()
        .then(function(doc){
            res.redirect('/sysadmin/subadmin');
        }).catch(function (err) {
            //console.log(err);
            res.status(500).json({
                error : err
            })
        });
    res.redirect('/sysadmin/subadmin');
};
exports.registerSuper = function(req, res, next) {
    var useVariable = {
        firstName: "Super",
        secondName: "Admin",
        email: "admin@boko.org",
        phoneNumber : "0",
        username: "super",
        password: "super",
        insertby: null,
        role: null,
        status : false,
    };
    var newUserModel = new Users(useVariable);
    newUserModel
        .save()
        .then(function(doc){
            req.flash('success','Registerd Successful Super Admin');
            res.redirect('/login');
        })
        .catch(function (err) {
            req.flash('error','Failed Registering');
            res.redirect('/login');
        });
    res.redirect('/login');
};
exports.ajaxEditSubAdmin = function(req, res, next) {

    Users.aggregate(
        [
            {$sort: { _id: -1 }},{ $match : { _id : mongoose.Types.ObjectId(req.query.userId )}},
        ]).limit(1)
        .exec(function(err, users) {
            if (err) { return next(err); }
            res.status(200).json(
                users[0]
            );
            //console.log(users)
        });
};
exports.editSubAdmin = function(req, res, next) {
    if(typeof req.file === 'undefined') {
        var useVariable = {
            username: req.body.username,
            email:req.body.email,
            phoneNumber : req.body.phonenumber,
            status : true
        };
    }else{
        var useVariable = {
            username: req.body.username,
            email:req.body.email,
            phoneNumber : req.body.phonenumber,
            profileImage: req.file.filename,
            status : true
        };
    }
   
    Users.update({_id : mongoose.Types.ObjectId(req.body.editId) }, useVariable, function(err, raw) {
        if (err) {
            req.flash('error','failed');
            res.redirect('/sysadmin/subadmin');
        }
        req.flash('success','SuccessFul');
        res.redirect('/sysadmin/subadmin');
    });

};

exports.subAdminDelete = function(req,res,next) {
    Users.update({ _id: req.body.DeleteId}, { "status": false }, function(err, raw) {
        if (err) {
            req.flash('error','failed');
            res.redirect('/sysadmin/subadmin');
        }
        req.flash('success','SuccessFul');
        res.redirect('/sysadmin/subadmin');
    });
};

exports.userscategory = function(req, res, next) {
    var username = req.user.firstName+ " "+ req.user.secondName ;
    UsersCategory.aggregate(
        [
            {$sort: { _id: -1 }},{ $match : { "status": true }}
        ]).exec()
        .then(function(categories) {
            if (req.user.role === null){
                res.render('watumiajicate',{categories:categories,username:username});
            } else {
                getUserDetails(req.user.role, function (result) {
                    if (result.ainawatumiaji === true) {
                        res.render('watumiajicate', {categories: categories, username: username});
                    }
                    else if (result.ainawatumiaji === false) {
                        res.render('permission', {username: username,});
                    }
                    else {
                        res.render('watumiajicate', {categories: categories, username: username});
                    }
                })
            }
        })
        .catch(function(err){
            res.status(500).json({
                error: err
            })
        });
};
exports.userscategoryPost = function(req, res, next){
    var Variables = {
        name : req.body.project_name,
        descriptions: req.body.descriptions,
        insertby: req.user._id,
        status: true
    };
    var newMuumini = new UsersCategory(Variables);
    newMuumini
        .save()
        .then(function(doc){
            req.flash('success','SuccessFul Registered');
            res.redirect('/userscategory');
        })
        .catch(function (err) {
            req.flash('error','Failed Registering');
            res.redirect('/userscategory');
        });
};
exports.editUserCategory = function(req, res, next) {
    var useVariable = {
        name : req.body.project_name,
        descriptions: req.body.descriptions,
        insertby: req.user._id,
        status: true
    };
    UsersCategory.update({_id : mongoose.Types.ObjectId(req.body.editId) }, useVariable, function(err, raw) {
        if (err) {
            req.flash('error','failed');
            res.redirect('/userscategory');
        }
        req.flash('success','SuccessFul');
        res.redirect('/userscategory');
    });

};
exports.deleteUserCategory = function(req,res,next) {
    UsersCategory.findByIdAndRemove({_id: mongoose.Types.ObjectId(req.body.muuminiId)}, function(err, doc)
    //UsersCategory.update({ _id: req.body.muuminiId}, { "status": false }, function(err, raw)
    {
        if (err) {
            req.flash('error','failed');
            res.redirect('/userscategory');
        }
        req.flash('success','SuccessFul');
        res.redirect('/userscategory');
    });
};
exports.ajaxEditUserCategory = function(req, res, next) {
    UsersCategory.aggregate(
        [
            {$sort: { _id: -1 }},{ $match : { _id : mongoose.Types.ObjectId(req.query.categoryId )}},
        ]).limit(1)
        .exec(function(err, users) {
            if (err) { return next(err); }
            res.status(200).json(
                users[0]
            );
        });
};

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

