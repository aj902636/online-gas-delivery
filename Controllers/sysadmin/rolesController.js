/**
 * Created by Ajay Kumar Tripathi on 10/13/2019.
 */
const Roles = require('../../Models/sysadmin/roles');
const Users1 = require('../../Models/users');
//const UsersCategory = require('../../Models/userscategory');
const systemModules = require('../../Models/systemmodule');
var mongoose = require("mongoose");

exports.adminRole = function(req , res , next){
    var username = req.user.username ;
    var id = req.params.id;
    console.log(id)
    Users1.find()
        .sort({ createdAt: "descending" })
        //.populate('role')
        .where('_id').equals(id)
        .where('status').equals(true)
        .exec(function(err, subAdmin) {
            Roles.findOne()
            .sort({ createdAt: "descending" })
            .where('role').equals(mongoose.Types.ObjectId(id))
            .exec(function(err, modules) {
                //console.log(modules)
                subAdmin[0]['modules'] = modules;
                console.log(subAdmin);
                res.render("sysadmin/role", {subAdmin: subAdmin, username: username, id:id});
            });
            
        });

};


exports.adminRole111 = function(req , res , next){
    var id = req.params.id;
    var search = { name : 'sub-admin'};
    console.log(search)
    var username = req.user.firstName+ " "+ req.user.secondName ;
    UsersCategory.aggregate(
            [
                {$sort: { _id: -1 }},{ $match : search},
                {$lookup: {from: 'systemmodules', localField: '_id', foreignField: 'role', as: 'modules'}},
                {$unwind: "$modules"},
            ]
        )
        .exec(function(err, majukumu) {
            console.log('ajay')
            console.log(majukumu);
            if (err) { return next(err); }
            res.render("sysadmin/role", {majukumu: majukumu, username: username, id:id});
            /*if (req.user.role === null){
                res.render("majukumu", {majukumu: majukumu, username: username});
            } else {
                getUserDetails(req.user.role, function (result) {
                    if (result.majukumu === true) {
                        res.render("majukumu", {majukumu: majukumu, username: username});
                    }
                    else if (result.majukumu === false) {
                        res.render('permission', {username: username,});
                    }
                    else {
                        res.render("majukumu", {majukumu: majukumu, username: username});
                    }
                })
            }*/
        })

};
exports.importReportC = function(req,res,next){
        var input = {
                dashboard : (req.query.dashboard === 1) ? true :  false,
                jengo : (req.query.jengo === 1) ? true :  false,
                uwakili :(req.query.uwakili === 1) ? true :  false,
                elimu :(req.query.elimu === 1) ? true :  false,
                nyingine: (req.query.nyingine === 1) ? true :  false,
                matangazo : (req.query.matangazo === 1) ? true :  false,
                ratiba : (req.query.ratiba === 1) ? true :  false,
                ripoti : (req.query.ripoti === 1) ? true :  false,
                mpangilio : (req.query.mpangilio === 1) ? true :  false,
                insertby : req.user._id,
                updatedby : req.user._id,
                role : mongoose.Types.ObjectId(req.query.role)
            };
    var options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
    };
    Modules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options,
            function(err, raw){
                req.flash('error','Failed Registering');
                //res.redirect('/report_ya_jengo');
            });
};
exports.dashboardClick = function(req,res,next){
    var input = {
            dashboard : req.query.dashboard,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    Roles.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.reportsClick = function(req,res,next){
    var input = {
            reports : req.query.reports,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    Roles.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.UwakiliClick = function(req,res,next){
    var input = {
            uwakili : req.query.uwakili,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.ElimuClick = function(req,res,next){
    var input = {
            elimu : req.query.elimu,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };

    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};

exports.MatangazoClick = function(req,res,next){
    var input = {
            matangazo : req.query.matangazo,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.userClick = function(req,res,next){
    var input = {
            user : req.query.user,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    Roles.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};

exports.vendorClick = function(req,res,next){
    var input = {
            vendor : req.query.vendor,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    Roles.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};

exports.SubAdminClick = function(req,res,next){
    console.log(req.query);
    var input = {
            subAdmin : req.query.subAdmin,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
        //console.log(input)
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    Roles.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};

exports.couponClick = function(req,res,next){
    var input = {
            coupon : req.query.coupon,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    Roles.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.requestGasClick = function(req,res,next){
    var input = {
            requestgas : req.query.requestgas,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    Roles.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.broadcastClick = function(req,res,next){
    var input = {
            broadcast : req.query.broadcast,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    Roles.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.RipotiElimuClick = function(req,res,next){
    var input = {
            ripotielimu : req.query.ripotielimu,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.MaoniClick = function(req,res,next){
    var input = {
            maoni : req.query.maoni,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.MaudhurioClick = function(req,res,next){
    var input = {
            maudhurio : req.query.maudhurio,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.WauminiClick = function(req,res,next){
    var input = {
            waumini : req.query.waumini,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.WatumiajiClick = function(req,res,next){
    var input = {
            watumiaji : req.query.watumiaji,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.MajukumuClick = function(req,res,next){
    var input = {
            majukumu : req.query.majukumu,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.AinaMatangazoClick = function(req,res,next){
    var input = {
            ainamatangazo : req.query.ainamatangazo,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.AinaHarambeeClick = function(req,res,next){
    var input = {
            ainaharambee : req.query.ainaharambee,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};
exports.AinaWatuamiajiClick = function(req,res,next){
    var input = {
            ainawatumiaji : req.query.ainawatumiaji,
            role : mongoose.Types.ObjectId(req.query.role),
            updatedby : req.user._id,
        };
    var options = {
        new: true,
        upsert: true,
        //setDefaultsOnInsert: true
    };
    systemModules.update({ role : mongoose.Types.ObjectId(req.query.role) },
            input,options)
        .then(function(docs) {
            res.status(200).json({
                collections : docs
            });
            //console.log(docs)
        }).catch(function(err){
            res.status(500).json({
                error: err
            });
        //console.log(err)

    });
};

exports.dataLoading = function(req,res,next){
    var search = {
            role : mongoose.Types.ObjectId(req.query.role),
        };
    systemModules.aggregate(
        [
            {$sort: { _id: -1 }},{ $match : search},
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
    SystemModules.find()
        .where('role').equals(roleId)
        .exec(function(err, roles) {
            if (err) { return next(err); }
            console.log(user);
            callback(roles[0]);
        });
}


