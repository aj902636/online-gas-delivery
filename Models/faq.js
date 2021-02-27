const mongoose = require('mongoose')
const { localeData } = require('moment')
const faq = new mongoose.Schema({
    question:{
        type : String,
        required : true,
    },
    answer :{
        type : String,
        required : true 
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
})

module.exports = mongoose.model('faq',faq)