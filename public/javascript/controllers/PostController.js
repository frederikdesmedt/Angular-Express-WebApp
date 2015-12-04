var app = angular.module('flapperNews');

app.controller("PostCtrl", [
	"$scope", "$stateParams", '$http', "postFactory", 'auth', function ($scope, $stateParams, $http, postFactory, auth) {

		$scope.post = postFactory.findById($stateParams.id);
		postFactory.loadComments($scope.post);

		$scope.incrementUpvotes = function (comment) {
			if (auth.isLoggedIn()) {
				postFactory.upvoteComment(comment);
			}
		};

		$scope.addComment = function () {
			if ($scope.body === '') { return; }

			postFactory.addComment($scope.post, {
				body: $scope.body,
				upvotes: 0
			});
		}

		$scope.isLoggedIn = auth.isLoggedIn;
	}]);