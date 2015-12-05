var app = angular.module('flapperNews');

app.controller('NavController', ['$scope', 'auth', '$state', 'Notification', function ($scope, auth, $state, Notification) {

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.currentUser = auth.currentUser;

  $scope.logOut = function () {
    auth.logout();
    Notification.warning({
      message: 'Please do come back!', title: 'Goodbye'
    });
    $state.go('login');
  };

}]);