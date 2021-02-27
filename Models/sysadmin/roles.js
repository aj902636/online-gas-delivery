/**
 * Created by Ajay Kumar Tripathi on 01/08/2019.
 */
var mongoose = require("mongoose");
var rolesSchema = new mongoose.Schema({
    role:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dashboard :{ type:Boolean,default:false },
    subAdmin:{ type:Boolean,default:false },
    user:{ type:Boolean,default:false },
    vendor:{ type:Boolean,default:false },
    coupon:{type:Boolean,default:false},
    requestgas:{type:Boolean,default:false},
    insertby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: { type:Boolean,default:true }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

var roles = module.exports = mongoose.model("roles", rolesSchema);
module.exports = roles;