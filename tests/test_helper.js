const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
	{
		title: 'React patterns',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7, __v: 0
	},
	{
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright',
		likes: 5,
		__v: 0
	}
]

const nonExistingId = async () => {
	const blog = new Blog({ title: 'willremovethissoon', author: 'willremovethissoon', url: 'willremovethissoon', likes: 0 })
	await blog.save()
	await blog.remove()

	return blog._id.toString()
}

const blogsInDb = async () => {
	const blogs = await Blog.find({})
	return blogs.map(blog => blog.toJSON())
}


// function that checks the blog's id has no underscore

const checkId = (blog) => {
	expect(blog.id).toBeDefined()
	expect(blog._id).not.toBeDefined()
}

const usersInDb = async () => {
	const users = await User.find({})
	return users.map(u => u.toJSON())
}

module.exports = {
	initialBlogs, nonExistingId, blogsInDb, checkId, usersInDb
}