const listHelper = require('../utils/list_helper')
const blogs = require('../utils/blogData')

describe('most likes', () => {
	const blogList = blogs
	test('the author with most likes', () => {
		const result = listHelper.mostLikes(blogList)
		expect(result).toEqual({
			author: 'Edsger W. Dijkstra',
			likes: 17
		})
	})
})