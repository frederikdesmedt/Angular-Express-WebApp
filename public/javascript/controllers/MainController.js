var app = angular.module('flapperNews');
app.controller('MainCtrl', [
	'$scope', '$rootScope', 'postFactory', '$state', 'auth', '$timeout', function ($scope, $rootScope, postFactory, $state, auth, $timeout) {
		auth.updateHeaders();
		$scope.posts = postFactory.posts;

		$scope.addPost = function () {
			postFactory.create({
				title: $scope.title,
				link: !$scope.link ? '' : $scope.link.indexOf("http://") == -1 && $scope.link.indexOf("https://") == -1 ? "http://" + $scope.link : $scope.link
			});

			$scope.link = '';
			$scope.title = '';
		}

		$scope.incrementUpvotes = function (post) {
			postFactory.upvote(post);
		};

		$scope.decrementUpvotes = function (post) {
			postFactory.downvote(post);
		}

		$scope.logout = function () {
			auth.logout();
			$state.go('login');
		};
	}]);