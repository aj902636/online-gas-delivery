/**
 * Created by Emman on 01/08/2019.
 */
var passport = require('passport');
//console.log(passport.user);
//var LocalStrategy = require('passport-local').Strategy;
const Users = require('../Models/users');
//
//const UsersCategory = require('../Models/userscategory');
/**
 * get all the Logins
 * @param req
 * @param res
 * @param next
 */
exports.login = function(req, res, next) {
    if(req.user){
        res.redirect('/');
    }else{
        res.render('login');
    }
};

exports.register = function(req, res, next){
    res.render('register', {});
}


exports.registerServiceProvider = function(req, res, next){
    console.log(req.body);
    var useVariable = {
        username: req.body.username,
        email: req.body.email,
        phoneNumber: req.body.mobile_number,
        companyDetails: req.body.cmpany_details,
        password: req.body.pwd1,
        role: 2,
        status: true
    };
    //console.log(useVariable);
    var newUserModel = new Users(useVariable);
    newUserModel.save()
        .then(function (doc) {
            req.flash('success','Registratin Successfull');
            res.redirect('/login');
        }).catch(function (err) {
            req.flash('error','Registration Failed');
            res.redirect('/register');
        });
}
