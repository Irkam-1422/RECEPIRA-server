const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    creations: {
        type: [String],
        required: false
    },
    collections: {
        type: [String],
        required: false
    },
    resume: {
        type: {},
        required: false
    },
    job: {
        type: {
            position: String,
            place: String
        },
        required: false
    },
    location: {
        type: String,
        required: false
    },
    likes: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
    }
})

const User = mongoose.model('User',userSchema)

module.exports = User