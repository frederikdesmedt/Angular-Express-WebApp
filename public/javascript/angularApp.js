var app = angular.module('flapperNews', ['ui.router', 'ngMaterial', 'ui-notification', 'angular-loading-bar']);

app.config(['$stateProvider', '$urlRouterProvider', 'NotificationProvider', function ($stateProvider, $urlRouterProvider, NotificationProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/templates/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['postFactory', function (postFactory) {
          return postFactory.getAll();
        }]
      }
    }).state('posts', {
      url: '/posts/{id}',
      templateUrl: '/templates/posts.html',
      controller: 'PostCtrl'
    }).state('login', {
      url: '/login',
      templateUrl: '/templates/login.html',
      controller: 'AuthController',
      onEnter: ['$state', 'auth', function ($state, auth) {
        if (auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    }).state('register', {
      url: '/register',
      templateUrl: '/templates/register.html',
      controller: 'AuthController',
      onEnter: ['$state', 'auth', function ($state, auth) {
        if (auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    });

  $urlRouterProvider.otherwise('/home');
  
  NotificationProvider.setOptions({
    positionX: 'left', positionY: 'top'
  });
}]);