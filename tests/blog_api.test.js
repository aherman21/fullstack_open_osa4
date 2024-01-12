const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const blog = require('../models/blog')
const helper = require('./test_helper')

beforeEach(async () => {
	await blog.deleteMany({})

	let blogObject = new blog(helper.initialBlogs[0])
	await blogObject.save()

	blogObject = new blog(helper.initialBlogs[1])
	await blogObject.save()
})

test('blogs are returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
	const response = await api.get('/api/blogs')

	expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
	const response = await api.get('/api/blogs')

	const titles = response.body.map(r => r.title)

	expect(titles).toContain(
		'Go To Statement Considered Harmful'
	)
})

test('a valid blog can be added', async () => {
	const newBlog = {
		title: 'async/await simplifies making async calls',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

	const titles = blogsAtEnd.map(n => n.title)
	expect(titles).toContain(
		'async/await simplifies making async calls'
	)
})

test('blog without title is not added', async () => {
	const newBlog = {
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
    
	const blogsAtEnd = await helper.blogsInDb()

	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

afterAll(async() => {
	await mongoose.connection.close()
})