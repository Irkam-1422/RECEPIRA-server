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
        description: { type: String },
        location: { type: String },
        experience: [{
            position: { type: String },
            company: { type: String },
            from: { type: String },
            until: { type: String },
            description: { type: String },
        }],
        education: [{
            institution: { type: String },
            type: { type: String },
            from: { type: String },
            until: { type: String },
            description: { type: String },
        }],
        languages: [{
            language: { type: String },
            level: { type: String },
        }],
        awards: [{
            award: { type: String },
            organisation: { type: String },
            year: { type: String },
            description: { type: String },
            file: { type: String },
        }]
    },
    job: {
        type: {
            position: String,
            place: String
        },
        required: false
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
    avatar: {
        type: String,
        default: ''
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
    }],
    notification: [{
        id: {type: String},
        name: {type: String},
        avatar: {type: String},
        action: {type: String},
    }]
})

const User = mongoose.model('User',userSchema)

module.exports = User