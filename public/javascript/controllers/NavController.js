var app = angular.module('flapperNews');

app.controller('NavController', ['$scope', 'auth', '$state', function ($scope, auth, $state) {

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.currentUser = auth.currentUser;

  $scope.logOut = function () {
    auth.logout();
    $state.go('login');
  };

}]);