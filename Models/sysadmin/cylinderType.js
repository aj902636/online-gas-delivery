/**
 * Created by Ajay Kumar Tripathi on 02/01/2020.
 */
var mongoose = require("mongoose");
var cylinderSchema = new mongoose.Schema({
    cylinderWeight :{ type:Number, default:0 },
    insertby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: { type:Boolean,default:true }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

var cylinserType = module.exports = mongoose.model("cylinserType", cylinderSchema);
module.exports = cylinserType;