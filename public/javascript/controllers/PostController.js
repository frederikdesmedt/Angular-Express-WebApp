var app = angular.module('flapperNews');

app.controller('PostCtrl', [
	'$scope', '$stateParams', '$http', 'postFactory', 'auth', function ($scope, $stateParams, $http, postFactory, auth) {
		auth.updateHeaders();
		postFactory.findById($stateParams.id).then(function(post) {
			$scope.post = post;
			postFactory.loadComments($scope.post);
		});

		$scope.incrementUpvotes = function (comment) {
			if (auth.isLoggedIn()) {
				comment.doILike = true;
				postFactory.upvoteComment(comment);
			}
		};
		
		$scope.decrementUpvotes = function (comment) {
			if (auth.isLoggedIn()) {
				comment.doILike = false;
				postFactory.downvoteComment(comment);
			}
		};

		$scope.addComment = function () {
			if ($scope.body === '') { return; }

			postFactory.addComment($scope.post, {
				body: $scope.body
			});
			
			$scope.body = '';
		};

		$scope.isLoggedIn = auth.isLoggedIn;
	}]);