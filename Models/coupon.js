const mongoose = require('mongoose')
const { localeData } = require('moment')
const coupon = new mongoose.Schema({
    coupon_name:{
        type : String,
        required : true,
    },
    coupon_description: {
        type : String,
        required : true
    },
    coupon_code: {
        type : String,
        required : true
    },
    percentage : {
        type : String,
        required : true,
    },
    image : {
        type : String,
        required : true, 
    },
    start_date : {
        type : Date,
        required : true 
    },
    end_date : {
        type : Date,
        required : true,
    },
    insertby: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
})

module.exports = mongoose.model('coupon',coupon)