const Blog = require('../models/blog')

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

module.exports = {
	initialBlogs, nonExistingId, blogsInDb
}