const mongoose = require('mongoose')
const bookGas = new mongoose.Schema({
    name:{
        type : String,
        required : true,
    },
    registrationid: {
        type : String,
        required : true
    },
    cylinderWeight : {
        type: Number,
        required :true,
    },
    address: {
        type : String,
        required : true
    },
    pincode : {
        type : Number,
        required : true,
    },
    amount : {
        type : String,
        required : true, 
    },
    venderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    insertby: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'User'
    },
    assignDeliveryBoyDate: {
        type: Date,
        default: null,
    },
    exectedDeliveryDate: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        default: 0     // status 0 => 'pending', 1=> "conform", 2=> "delivered", 3=> "reject"
    }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
})

module.exports = mongoose.model('bookGas',bookGas)