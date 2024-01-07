const _ = require('lodash')

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

// function to find the blog with most likes and return the blogs author, title and likes

const favoriteBlog = (blogs) => {
	const reducer = (max, blog) => {
		return (max.likes || 0) > blog.likes ? max : blog
	}
	const mostLikedBlog = blogs.reduce(reducer, {})

	return {
		title: mostLikedBlog.title,
		author: mostLikedBlog.author,
		likes: mostLikedBlog.likes
	}
}

// function to find the author with most blogs and return the authors name and number of blogs

const mostBlogs = (blogs) => {
	const reducer = (max, blog) => {
		return (max.blogs || 0) > blog.blogs ? max : blog
	}
	const mostBlogs = blogs.reduce(reducer, {})
	const blogsByAuthor = blogs.map(blog => blog.author)

	return {
		author: mostBlogs.author,
		blogs: blogsByAuthor.filter(author => author === mostBlogs.author).length
	}
}

const mostLikes = (blogs) => {
	//group blogs by author
	const blogsByAuthor = _.groupBy(blogs, 'author')

	const authorLikeCounts = _.map(blogsByAuthor, (blogs, author) => {
		return {
			author: author,
			likes: _.sumBy(blogs, 'likes')
		}
	})
	const mostLikedAuthor = _.maxBy(authorLikeCounts, 'likes')

	return mostLikedAuthor
}


module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
}