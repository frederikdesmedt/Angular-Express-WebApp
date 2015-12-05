var app = angular.module('flapperNews');

app.controller('AuthController', ['$scope', '$state', 'auth', 'Notification', function ($scope, $state, auth, Notification) {

	$scope.error = {};
	$scope.user = {};

	$scope.validatePassword = function () {
		if (!$scope.user.repeatPassword) {
			return false;
		}

		if ($scope.user.password !== $scope.user.repeatPassword) {
			$scope.error = { password: true };
			return false;
		}

		return true;
	};

	$scope.register = function () {
		if (!$scope.validatePassword()) {
			return;
		}

		auth.register($scope.user).error(function (response) {
			$scope.error = response;
		}).then(function () {
			auth.updateHeaders();
			$state.go('home');
			Notification.success({
				message: 'Welcome to the forum, you have fun!',
				title: 'Succesfully registered'
			});
		});
	};

	$scope.login = function () {
		auth.login($scope.user).error(function (error) {
			$scope.error = error;
		}).then(function () {
			auth.updateHeaders();
			Notification({
				message: 'Feel free to post, like or comment anything you feel like!',
				title: 'Welcome back ' + auth.currentUser()
			});
			$state.go('home');
		});
	};

	$scope.checkUsername = function (callback) {
		auth.checkUsername($scope.user).success(function (response) {
			callback(response);
		});
	};
}]);