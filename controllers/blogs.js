const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
		.populate('user', { username: 1, name: 1 })
	response.json(blogs)
}
)

blogsRouter.post('/', async (request, response) => {
	const body = request.body

	const user = await User.findOne()

	const populatedUser = await User.findById(user._id).populate('blogs', { url: 1, title: 1, author: 1 })
	console.log(populatedUser)
	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
		user: populatedUser._id
	})
	const savedBlog = await blog.save()

	populatedUser.blogs = populatedUser.blogs.concat(savedBlog._id)
	await populatedUser.save()

	response.json(savedBlog)
})

//updating a blog
blogsRouter.put('/:id', async (request, response, next) => {
	const body = request.body
	const blog = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0
	}
	try {
		const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
		response.json(updatedBlog)
	} catch (exception) {
		next(exception)
	}
})

//deleting a blog
blogsRouter.delete('/:id', async (request, response, next) => {
	try {
		await Blog.findByIdAndRemove(request.params.id)
		response.status(204).end()
	} catch (exception) {
		next(exception)
	}
})

module.exports = blogsRouter