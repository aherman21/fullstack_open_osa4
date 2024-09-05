const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	author: String,
	url: {
		type: String,
		required: true
	},
	likes: Number,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
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