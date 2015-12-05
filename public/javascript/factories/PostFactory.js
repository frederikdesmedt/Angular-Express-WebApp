var app = angular.module('flapperNews');

app.factory('postFactory', ['$http', 'auth', function ($http, auth) {
	var postFactory = {
		posts: []
	};

	// private
	var getInternal = function () {
		return $http.get('/posts').then(function (data) {
			angular.copy(data.data, postFactory.posts);
			return data;
		});
	};

	postFactory.getAll = function () {
		getInternal().then(function (data) {
			if (auth.isLoggedIn()) {
				postFactory.posts.forEach(function (post) {
					post.doILike = post.upvotes.indexOf(auth.getPayload()._id) >= 0;
				});
			}
		});
	};

	postFactory.findById = function (id) {
		return new Promise(function (resolve, reject) {
			var resolveFunction = function () {
				resolve(postFactory.posts.filter(function (val) {
					return val._id == id;
				})[0]);
			};

			if (postFactory.posts.length === 0) {
				getInternal().then(resolveFunction);
			} else {
				resolveFunction();
			}
		});
	};

	postFactory.create = function (post) {
		$http.post('/posts', post).success(function (post) {
			postFactory.posts.push(post);
		});
	};

	postFactory.upvote = function (post) {
		return $http.put('/posts/' + post._id + '/upvote').success(function (data) {
			post.upvotes = data.upvotes;
			post.doILike = true;
		});
	};

	postFactory.downvote = function (post) {
		return $http.put('/posts/' + post._id + '/downvote').success(function (data) {
			post.upvotes = data.upvotes;
			post.doILike = false;
		});
	};

	postFactory.upvoteComment = function (comment) {
		return $http.put('/comments/' + comment._id + '/upvote').success(function (data) {
			comment.upvotes = data.upvotes;
		});
	};

	postFactory.downvoteComment = function (comment) {
		return $http.put('/comments/' + comment._id + '/downvote').success(function (data) {
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
			post.comments.forEach(function (comment) {
				comment.doILike = comment.upvotes.indexOf(auth.getPayload()._id) >= 0;
			});
		});
	};

	return postFactory;
}]);