const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
	const { username, name, password } = request.body


	if (!password) {
		return response.status(400).json({ error: 'password missing' })
	} else if (password.length < 3) {
		return response.status(400).json({ error: 'password must be at least 3 characters long' })
	} else if (!username) {
		return response.status(400).json({ error: 'username missing' })
	} else if (username.length < 3) {
		return response.status(400).json({ error: 'username is shorter than the minimum allowed length (3)' })
	}

	const saltRounds = 10
	const passwordHash = await bcrypt.hash(password, saltRounds)

	const user = new User({
		username,
		name,
		passwordHash
	})

	try {
		const existingUser = await User.findOne({ username: user.username })
		if (existingUser) {
			return response.status(400).json({ error: 'username must be unique' })
		}

		const savedUser = await user.save()
		response.status(201).json(savedUser)
	} catch (error) {
		response.status(400).json({ error: 'something went wrong' })
	}
})

usersRouter.get('/', async (request, response) => {
	const users = await User
		.find({}).populate('blogs', { url: 1, title: 1, author: 1 })

	response.json(users)
})

module.exports = usersRouter