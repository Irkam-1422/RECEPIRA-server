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
        type: ingrSchema,
        required: false
    },
    instructions: {
        type: instrSchema,
        required: false
    },
    author: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
    },
    hashtags: {
        type: String,
        required: false
    },
    likes: {
        type: Number,
        default: 0
    }
})

const Post = mongoose.model('Post',postSchema)

module.exports = Post