const async = require('async')

var Model = function(mongoose) {
	var schema = new mongoose.Schema({
		ObjectId	: mongoose.Schema.ObjectId,
		from		: {
			type: mongoose.Schema.ObjectId,
			ref: 'user',
		},
		to			: {
			type: mongoose.Schema.ObjectId,
			ref: 'user',
		},
		text		: String,
		images		: [String],
		hiddenFrom	: {type: Boolean, default: false},
		hiddenTo	: {type: Boolean, default: false},
		read 		: {type: Boolean, default: false},
		createdAt	: {type: Date, default: Date.now},
	})

	var Model = mongoose.model('message', schema);

	return {
		send: (from, to, text, callback) => {
			from = MOI(from)
			to = MOI(to)

			let message = new Model()
			Object.assign(message, {from, to, text})
			message.populate('from to').save((err, message) => {
				Model.populate(message, {path: "from to"}, callback)
			})
		},

		getConversations: (user, callback) => {
			user = MOI(user)

			Model.aggregate(
				{
					$match: {
						$or: [{to: user}, {from: user}]
					}
				},
				{
					$sort: {
						createdAt: 1
					}
				},
				{
					$group: {
						id: {$last: "$_id"},
						_id: {from: "$from", to: "$to"},
						text: {$last: "$text"},
						images: {$last: "$images"},
						createdAt: {$last: "$createdAt"},
						read: {$max: "$read"},
					}
				},
				{
					$lookup: {
						from: 'users',
						localField: '_id.from',
						foreignField: '_id',
						as: 'from'
					},
				},
				{
					$lookup: {
						from: 'users',
						localField: '_id.to',
						foreignField: '_id',
						as: 'to'
					},
				}
			).exec((err, results) => {
				// console.log(results)
				// Normalize users list
				// results = results.map((c) => {
				// 	c._id.u = c._id.u.sort()

				// 	return c
				// })

				results = results.filter((c) => {
					let cUsersJSON = JSON.stringify([c._id.from, c._id.to].sort())

					for (let c2 of results) {
						let c2UsersJSON = JSON.stringify([c2._id.from, c2._id.to].sort())

						if (cUsersJSON == c2UsersJSON && c.createdAt < c2.createdAt) return false
					}

					return true
				})

				// console.log(require('util').inspect(results, {showHidden: true, depth: null}))	

				if (results) {
					results = results.map((c) => {
						c._id = c.id

						c.from = c.from[0]
						c.to = c.to[0]

						return c
					})

					return callback(err, results)
				}

				return callback(err)
			})
		},

		getConversation: (user1, user2, skip = 0, limit = 10, callback) => {
			user1 = MOI(user1)
			user2 = MOI(user2)

			skip = Number(skip)
			limit = Number(limit)

			Model.find({$or: [
				{
					$and: [
						{from: user1},
						{to: user2},
					]
				},
				{
					$and: [
						{from: user2},
						{to: user1},
					]
				},
			]}).populate('from to').skip(skip).limit(limit).lean().sort({createdAt: 'asc'}).exec(callback)
		},

		setRead: (user, ids, callback) => {
			
		}
	}
}

module.exports = Model