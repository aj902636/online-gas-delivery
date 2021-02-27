const mongoose = require('mongoose')
const bookingAmount = new mongoose.Schema({
    amount : {
        type : String,
        required : true, 
    },
    cylinderWeight : {
        type : Number,
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

module.exports = mongoose.model('bookingAmount',bookingAmount)