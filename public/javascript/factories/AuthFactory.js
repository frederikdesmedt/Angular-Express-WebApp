var app = angular.module('flapperNews');

app.factory('auth', ['$http', '$window', function ($http, $window) {
	var auth = {};

	auth.updateHeaders = function () {
		$http.defaults.headers.common.Authorization = 'Bearer ' + $window.localStorage['flapper-news-token'];
	};

	auth.saveToken = function (token) {
		$window.localStorage['flapper-news-token'] = token;
		auth.updateHeaders();
	};

	auth.checkUsername = function (user) {
		return $http.post('/available', user);
	}

	auth.getToken = function () {
		return $window.localStorage['flapper-news-token'];
	};

	auth.getPayload = function () {
		var token = auth.getToken();
		if (token) {
			return JSON.parse(window.atob(token.split('.')[1]));
		}
	};

	auth.isLoggedIn = function () {
		var payload = auth.getPayload();
		if (payload) {
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function () {
		var payload = auth.getPayload();
		if (payload) {
			return payload.username;
		}
	};

	auth.register = function (user) {
		return $http.post('/register', user).success(function (token) {
			auth.login(user);
		});
	};

	auth.login = function (user) {
		return $http.post('/login', user).success(function (token) {
			auth.saveToken(token.token);
		});
	};

	auth.logout = function () {
		$window.localStorage.removeItem('flapper-news-token');
		$http.defaults.headers.common.Authorization = '';
	};

	return auth;
}]);