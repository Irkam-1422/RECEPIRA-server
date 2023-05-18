const mongoose = require('mongoose')
const Schema = mongoose.Schema

const jobSchema = new Schema({
    position: {
        type: String,
        required: true
    },
    company: {
        name: {
            type: String
        },
        id: {
            type: String,
            required: true
        }
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: false
    },
    from: {
        type: String,
        required: false
    },
    fulltime: {
        type: String,
        required: false
    },
    description: {
        type: String,
    },
    applicants: {
        type: [String]
    }
})

const Job = mongoose.model('Job',jobSchema)

module.exports = Job