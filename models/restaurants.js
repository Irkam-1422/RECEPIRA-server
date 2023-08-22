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
        type: Number,
        default: 0
    },
    followers: {
        type: [String],
        default: []
    },
    following: {
        type: [String],
        default: []
    },
    chats: [{
        room: {type: String},
        users: [{
            id: {type: String},
            name: {type: String},
            avatar: {type: String},
        }],
        messages: [{
            message: {type: String},
            from: {type: String}
        }]
    }],
    messages: [{
        room: {type: String},
        unread: {type: Number},
    }]
})

const Restaurant = mongoose.model('Restaurant',restaurantSchema)

module.exports = Restaurant