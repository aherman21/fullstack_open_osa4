const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const { default: test } = require('node:test')

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

test('blog without url is not added', async () => {
	const newBlog = {
		title: 'async/await simplifies making async calls',
		author: 'Michael Chan',
		likes: 7

	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
	
	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('blog without likes is added with 0 likes', async () => {
	const newBlog = {
		title: 'async/await simplifies making async calls',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/'
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd[helper.initialBlogs.length].likes).toBe(0)
})

test('blogs id is without underscore', async () => {
	const response = await api.get('/api/blogs')
	const blogs = response.body
	// log the blogs

	blogs.forEach(blog => {
		helper.checkId(blog)
	})
})

test('a blog can be updated', async () => {
	const blogsAtStart = await helper.blogsInDb()
	const blogToUpdate = blogsAtStart[0]

	await api
		.put(`/api/blogs/${blogToUpdate.id}`)
		.send({ likes: 20000 })
		.expect(200)
	
	const blogsAtEnd = await helper.blogsInDb()
	console.log(blogsAtEnd)
	expect(blogsAtEnd[0].likes).toBe(20000)
})

test('a blog can be deleted', async () => {
	const blogsAtStart = await helper.blogsInDb()
	const blogToDelete = blogsAtStart[0]

	await api
		.delete(`/api/blogs/${blogToDelete.id}`)
		.expect(204)

	const blogsAtEnd = await helper.blogsInDb()

	expect(blogsAtEnd).toHaveLength(
		helper.initialBlogs.length - 1
	)
	console.log(blogsAtEnd)
	const titles = blogsAtEnd.map(r => r.title)
	expect(titles).not.toContain(blogToDelete.title)
})

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})

		const passwordHash = await bcrypt.hash('sekret', 10)
		const user = new User({ username: 'root', passwordHash })

		await user.save()
	})

	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'mluukkai',
			name: 'Matti Luukkainen',
			password: 'salainen',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map((u) => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'root',
			name: 'Superuser',
			password: 'salainen',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('expected `username` to be unique')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails with proper statuscode and message if username is less than 3 characters', async () => {

		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username : 'ro',
			name: 'Superuser',
			password: 'salainen',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		
		expect(result.body.error).toContain('is shorter than the minimum allowed length (3)')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)	
	})

	test('creation fails with proper statuscode and message if username is missing', async () => {

		const usersAtStart = await helper.usersInDb()

		const newUser = {
			name: 'Superuser',
			password: 'salainen',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		
		expect(result.body.error).toContain('username missing')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails with proper statuscode and message if password is less than 3 characters', async () => {

		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username : 'root',
			name: 'Superuser',
			password: 'sa',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		
		expect(result.body.error).toContain('password must be at least 3 characters long')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails with proper statuscode and message if password is missing', async () => {

		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username : 'root',
			name: 'Superuser',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('password missing')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})
})


afterAll(async() => {
	await mongoose.connection.close()
})