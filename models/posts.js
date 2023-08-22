const mongoose = require('mongoose')
const Schema = mongoose.Schema

const itemSchema = new Schema({
    amount: Number,
    value: String,
    name: String
})
const stepSchema = new Schema({
    text: String,
    photo: String
})
const ingrSchema = new Schema({
    titleIng: String,
    items: String
})
const instrSchema = new Schema({
    titleInstr: String,
    steps: String
})

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    ingredients: {
        titleIng: {type: String},
        items: [{
            amount: {type: String},
            value: {type: String},
            name: {type: String}
        }]
    },
    instructions: {
        titleInstr: {type: String},
        steps: [{
            text: {type: String},
            photo: {type: String},
        }]
    },
    author: {
        type: String,
        required: false
    },
    author_info: {
        name: {type: String},
        avatar: {type: String}
    },
    category: {
        type: String,
        required: false
    },
    hashtags: {
        type: [String],
        default: []
    },
    likes: {
        type: [String],
    }
})

const Post = mongoose.model('Post',postSchema)

module.exports = Post