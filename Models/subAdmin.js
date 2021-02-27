const mongoose = require('mongoose')


const sub_admin = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    insertby: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    }

})

module.exports = mongoose.model('sub_admin',sub_admin)