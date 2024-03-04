const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const helper = require('./test_helper')

const blog = require('../models/blog')
const User = require('../models/user')

let token

describe('when there is initially some blogs saved', () => {
	beforeEach(async () => {
		await blog.deleteMany({})
		await User.deleteMany({})

		// create a user
		const passwordHash = await bcrypt.hash('sekret', 10)
		const testUser = new User({ username: 'root_test', passwordHash })

		// create another user for testing

		const passwordHash2 = await bcrypt.hash('sekret', 10)
		const testUser2 = new User({ username: 'root_test2', passwordHash: passwordHash2 })

		const savedUser = await testUser.save()
		const savedUser2 = await testUser2.save()

		const userForToken = {
			username: savedUser.username,
			id: savedUser._id
		}


		// create the token with the user id
		token = jwt.sign(userForToken, process.env.SECRET)

		// create the blogs that are posted by the user
		let blogObject = new blog({ ...helper.initialBlogs[0], user: savedUser._id})
		await blogObject.save()

		blogObject = new blog({ ...helper.initialBlogs[1], user: savedUser2._id})
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

	test('a valid blog can be added by an authenticated user', async () => {
		const newBlog = {
			title: 'async/await simplifies making async calls',
			author: 'Michael Chan',
			url: 'https://reactpatterns.com/',
			likes: 7,
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.set('Authorization', `Bearer ${token}`)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

		const titles = blogsAtEnd.map(n => n.title)
		expect(titles).toContain(
			'async/await simplifies making async calls'
		)

	})

	test('a valid blog cannot be added by an unauthenticated user', async () => {
		const newBlog = {
			title: 'async/await simplifies making async calls',
			author: 'Michael Chan',
			url: 'https://reactpatterns.com/',
			likes: 7,
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(401)
		
		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
	})

	test('blog without title is not added', async () => {
		const newBlog = {
			author: 'Michael Chan',
			url: 'https://reactpatterns.com/',
			likes: 7,
		}

		const result = await api
			.post('/api/blogs')
			.send(newBlog)
			.set('Authorization', `Bearer ${token}`)
			.expect(400)

		expect(result.body.error).toContain('title missing')

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
	})

	test('blog without url is not added', async () => {
		const newBlog = {
			title: 'async/await simplifies making async calls',
			author: 'Michael Chan',
			likes: 7,
		}

		const result = await api
			.post('/api/blogs')
			.send(newBlog)
			.set('Authorization', `Bearer ${token}`)
			.expect(400)

		expect(result.body.error).toContain('url missing')

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
			.set('Authorization', `Bearer ${token}`)
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

	test('the user can delete his/her blog', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToDelete = blogsAtStart[0]
		console.log('blog to delete: ', blogToDelete)
		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204)
		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
		const titles = blogsAtEnd.map(r => r.title)
		expect(titles).not.toContain(blogToDelete.title)
	})

	test('a blog cannot be deleted by an unauthenticated user', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToDelete = blogsAtStart[1]

		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(401)
		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
	})
})


describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})

		const passwordHash = await bcrypt.hash('sekret', 10)
		const user = new User({ username: 'root_user_test', passwordHash })

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
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map((u) => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'root_user_test',
			name: 'Superuser',
			password: 'salainen',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('username must be unique')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	}, 10000)

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
		
		expect(result.body.error).toContain('username is shorter than the minimum allowed length (3)')

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