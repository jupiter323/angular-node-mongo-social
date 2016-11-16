var Model = function(mongoose) {
	var schema = new mongoose.Schema({
		ObjectId	: mongoose.Schema.ObjectId,
		author		: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		post		: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'article',
		},
		images		: [String],
		text		: String,
		createdAt	: {type: Date, default: Date.now},
		likes		: {type: Number, default: 0},
		dislikes	: {type: Number, default: 0},
	})

	var Model = mongoose.model('comment', schema);

	return {
		addComment: (post, author, text, images, callback) => {
			if (typeof post !== 'object') post = mongoose.Types.ObjectId(post)
			if (typeof author !== 'object') author = mongoose.Types.ObjectId(author)

			let comment = new Model()
			Object.assign(comment, {
				author, post, text, images
			})

			comment.save(callback)
		},

		getPostsComments: (postIds, callback) => {
			let result = {}

			postIds = postIds.map((id) => {
				if (typeof id !== 'object') return mongoose.Types.ObjectId(id)
				else return id
			})

			Model.find({post: {$in: postIds}}).populate('author').exec((err, comments) => {
				for (let comment of comments) {
					let postId = comment.post

					if (result[postId] === undefined) {
						result[postId] = []
					}

					result[postId].push(comment)
				}

				callback(err, result)
			})
		},

		getPostComments: (post, callback) => {
			if (typeof post !== 'object') post = mongoose.Types.ObjectId(post)

			Model.find({post}).populate('author').exec((err, comments) => {
				callback(err, comments)
			})
		},

		getByUser: (author, callback) => {
			if (typeof author !== 'object') author = mongoose.Types.ObjectId(author)

			Model.find({author}).select('-__v').populate('author').sort({createdAt: 'desc'}).exec(callback)
		},

		getByArticles: (articlesIds, callback) => {
			Model.find({post: {$in: articlesIds}}).exec(callback)
		}
	}
}

module.exports = Model