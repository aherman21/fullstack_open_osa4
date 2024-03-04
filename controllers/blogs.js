const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const userExtractor = require('../utils/middleware').userExtractor
const tokenExtractor = require('../utils/middleware').tokenExtractor

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
		.populate('user', { username: 1, name: 1 })
	response.json(blogs)
}
)


blogsRouter.post('/', tokenExtractor, userExtractor, async (request, response) => {
	const body = request.body
	const user = request.user

	if (user) {
		const populatedUser = await User.findById(user._id).populate('blogs', { url: 1, title: 1, author: 1 })
		console.log(populatedUser)
		const blog = new Blog({
			title: body.title,
			author: body.author,
			url: body.url,
			likes: body.likes || 0,
			user: populatedUser._id
		})
		if (!body.title) {
			return response.status(400).json({ error: 'title missing' })
		} else if (!body.url) {
			return response.status(400).json({ error: 'url missing' })
		}
		const savedBlog = await blog.save()

		populatedUser.blogs = populatedUser.blogs.concat(savedBlog._id)
		await populatedUser.save()

		response.status(201).json(savedBlog)
	} else {
		return response.status(401).json({ error: 'token invalid' })
	}
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
	} catch (error) {
		next(error)
	}
})

//deleting a blog so that only the user who created the blog can delete it and if error occurs, it is passed to the error handler
blogsRouter.delete('/:id', tokenExtractor, userExtractor, async (request, response, next) => {
	const user = request.user
	console.log('user: ',user)
	try {
		const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
		console.log('blog: ',blog)
		console.log('blog.user: ',blog.user)
		if (blog.user._id.toString() === user._id.toString()) {
			await Blog.findByIdAndRemove(request.params.id)
			response.status(204).end()
		} else {
			console.log('blogsuserid: ',blog.user._id.toString())
			console.log('userid: ',user._id.toString())
			return response.status(401).json({ error: 'unauthorized'})
		}
	} catch (error) {
		next(error)
	}
})

module.exports = blogsRouter