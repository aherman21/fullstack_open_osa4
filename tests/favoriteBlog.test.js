const blogs = require('../utils/blogData')
const listHelper = require('../utils/list_helper')


describe('favorite blog', () => {
	const blogList = blogs
	test('the blog with most likes', () => {
		const result = listHelper.favoriteBlog(blogList)
		expect(result).toEqual({
			title: 'Canonical string reduction',
			author: 'Edsger W. Dijkstra',
			likes: 12
		})
	})
})