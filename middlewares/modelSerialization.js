function serializePost(post) {
	var serialized = {
		_id: post._id,
		author: post.author,
		title: post.title,
		comments: post.comments,
		link: post.link,
		upvotesArray: post.upvotes
	};

	var count = 0;
	for (var index in post.upvotes) {
		count++;
	}

	serialized.upvotes = count;
	return serialized;
}

exports.posts = function (req, res, next) {
	if (res.serialize) {
		if (res.serialize instanceof Array) {
			var json = [];
			for (var index in res.serialize) {
				var post = serializePost(res.serialize[index]);
				if (req.payload) {
					post.you = res.serialize.indexOf(req.payload._id) >= 0;
				}
				json.push(post);
			}

			res.json(json);
		}
	}
}