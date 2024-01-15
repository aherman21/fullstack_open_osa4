const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	Author: String,
	url: String,
	likes: Number
})

blogSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		// return the _id without the underscore
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		// return the __v without the underscore
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Blog', blogSchema)