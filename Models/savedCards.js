const mongoose = require('mongoose')
const Cards = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    card_number: {
        type: String ,
        required: true,
    },
    expiry: {
        month:{
            type: Number,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        }
    },
    CVV: {
        type: Number,
        required: true
    }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
})

module.exports = mongoose.model('Paymentcards', Cards)