/**
 * Created by Ajay kumar Tripathi on 02/02/2020.
 */
const Users = require('../../Models/users');
const cylinderType = require('../../Models/sysadmin/cylinderType'); 
const SystemModules = require('../../Models/systemmodule');
const roles = require('../../Models/sysadmin/roles');
var mongoose = require("mongoose");

exports.listing = function(req , res , next){
    var username = req.user.username;
    var usercat = {};
    cylinderType.find()
        .sort({ createdAt: "descending" })
        .populate('insertby','username')
        .where('status').equals(true)
        .exec(function(err, cylinserType) {
            console.log(cylinserType);
            getUserDetails(req.user._id, function (result) {
                if(err)res.status(500).json({error: err})
                if(req.user.role === 1){
                    res.render("sysadmin/cylinserType", {cylinserType: cylinserType, username: username});
                }else if(result.subAdmin === true) {
                    res.render("sysadmin/cylinserType", {cylinserType: cylinserType, username: username});
                }else if(result.subAdmin === false) {
                    res.render('sysadmin/permission', {username: username});
                }
            });
            
        });
};
exports.addCylinderType = function(req, res, next) {
    var cylinderVariable = {
        cylinderWeight: req.body.cylinderweight,
        insertby : req.user._id,
        status : true
    };
    
    var newCylinderModel = new cylinderType(cylinderVariable);
    newCylinderModel.save()
        .then(function(doc){
            res.redirect('/sysadmin/cylinderType');
        }).catch(function (err) {
            console.log(err);
            res.status(500).json({
                error : err
            })
        });
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
exports.cylinderTypeDelete = function(req,res,next) {
    cylinderType.findByIdAndRemove({_id: mongoose.Types.ObjectId(req.body.DeleteId)}, function(err, doc){
        if (err) {
            req.flash('error','failed');
            res.redirect('/sysadmin/cylinderType');
        }
        req.flash('success','SuccessFul');
        res.redirect('/sysadmin/cylinderType');
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

