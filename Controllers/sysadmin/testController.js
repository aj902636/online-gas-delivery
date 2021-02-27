/**
 * Created by Emman on 01/08/2019.
 */
const SystemModules = require('../../Models/systemmodule');
var mongoose = require("mongoose");
const SubAdmin = require('../../Models/users');

exports.test = function(req, res, next){
    console.log('dfs');
    res.render('sysadmin/test');
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