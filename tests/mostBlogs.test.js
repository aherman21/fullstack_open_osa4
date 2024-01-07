const listHelper = require('../utils/list_helper')
const blogs = require('../utils/blogData')

describe('most blogs', () => {
	const blogList = blogs
	test('the author with most blogs', () => {
		const result = listHelper.mostBlogs(blogList)
		expect(result).toEqual({
			author: 'Robert C. Martin',
			blogs: 3
		})
	})
})
