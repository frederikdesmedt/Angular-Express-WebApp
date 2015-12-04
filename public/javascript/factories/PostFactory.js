var app = angular.module('flapperNews');

app.factory('postFactory', ['$http', 'auth', function ($http, auth) {
	var postFactory = {
		posts: []
	};

	postFactory.getAll = function () {
		$http.get('/posts').success(function (data) {
			angular.copy(data, postFactory.posts);
			if (auth.isLoggedIn()) {
				postFactory.posts.forEach(function (post) {
					post.doILike = post.upvotes.indexOf(auth.getPayload()._id) >= 0;
				});
			}
		}).error(function (data, status) {
			console.log('Couldn\'t retrieve data, ' + status + ': ' + data);
		});
	};

	postFactory.findById = function (id) {
		return postFactory.posts.filter(function (val) {
			return val._id == id;
		})[0];
	}

	postFactory.create = function (post) {
		$http.post('/posts', post).success(function (post) {
			postFactory.posts.push(post);
		})
	}

	postFactory.upvote = function (post) {
		return $http.put('/posts/' + post._id + '/upvote').success(function (data) {
			post.upvotes = data.upvotes;
			post.doILike = true;
		});
	}

	postFactory.downvote = function (post) {
		return $http.put('/posts/' + post._id + '/downvote').success(function (data) {
			post.upvotes = data.upvotes;
			post.doILike = false;
		});
	}

	postFactory.upvoteComment = function (comment) {
		return $http.put('/comments/' + comment._id + '/upvote').success(function (data) {
			comment.upvotes = data.upvotes;
		});
	};

	postFactory.addComment = function (post, comment) {
		$http.post('/posts/' + post._id + '/comment', comment).success(function (data) {
			post.comments.push(data);
		});
	};

	postFactory.loadComments = function (post) {
		$http.get('/posts/' + post._id + '/comments').success(function (data) {
			post.comments = data;
		});
	};

	return postFactory;
}]);