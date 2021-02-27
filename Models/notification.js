const mongoose = require('mongoose')
const { localeData } = require('moment')
const notification = new mongoose.Schema({
    title:{
        type : String,
        required : true,
    },
    message :{
        type : String,
        required : true 
    },
    bookingid : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookGas'
    },
    venderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    insertby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminisview :{
        type : Number,
        default:0,            //0=>not seen, 1=>seen
    },
    userisview :{
        type : Number,
        default:0,             //0=>not seen, 1=>seen
    },
    venderisview :{
        type : Number,
        default:0,             //0=>not seen, 1=>seen
    },
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
})

module.exports = mongoose.model('notification',notification)