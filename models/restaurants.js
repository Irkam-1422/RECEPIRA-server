const mongoose = require('mongoose')
const Schema = mongoose.Schema

const restaurantSchema = new Schema({
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
    location: {
        type: String,
    },
    avatar: {
        type: String,
    },
    creations: {
        type: [String]
    },
    jobs: {
        type: [String]
    },
    likes: {
        type: Number
    }
})

const Restaurant = mongoose.model('Restaurant',restaurantSchema)

module.exports = Restaurant