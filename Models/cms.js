const mongoose = require('mongoose')
const { localeData } = require('moment')
const cms = new mongoose.Schema({
    title:{
        type : String,
        required : true,
    },
    discription :{
        type : String,
    },
    email :{
        type : String,
    },
    mobile :{
        type : String,
    },
    address :{
        type : String,
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
})

module.exports = mongoose.model('cms',cms)