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


module.exports = {
	dummy,
	totalLikes,
	favoriteBlog
}