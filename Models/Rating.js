const mongoose = require('mongoose')
const Rating = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'bookingAmount'
    },
    Rating: {
        type: Number,
        required: true,
        default: 0,
    },
    Comments: {
        type: String,
        default: " "
    }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
})

module.exports = mongoose.model('Ratings', Rating)