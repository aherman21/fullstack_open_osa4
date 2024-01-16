const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
	response.json(blogs)
}
)


blogsRouter.post('/', async (request, response, next) => {
	const body = request.body

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0
	})
	try {
		const savedBlog = await blog.save()
		response.status(201).json(savedBlog)
	} catch (exception) {
		response.status(400).json(exception)
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