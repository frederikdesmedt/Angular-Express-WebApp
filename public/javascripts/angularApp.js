var app = angular.module("flapperNews", ['ui.router']);

app.controller("MainCtrl", [
  "$scope", "postFactory", '$state', 'auth', function ($scope, postFactory, $state, auth) {
    $scope.posts = postFactory.posts;

    $scope.addPost = function () {
      postFactory.create({
        title: $scope.title,
        link: $scope.link
      });

      $scope.link = "";
      $scope.title = "";
    }

    $scope.incrementUpvotes = function (post) {
      postFactory.upvote(post);
    };
    
    $scope.logout = function() {
      auth.logout();
      $state.go('login');
    };
    
  }]);

app.factory("postFactory", ['$http', function ($http) {
  var postFactory = {
    posts: []
  };

  postFactory.getAll = function () {
    $http.get('/posts').success(function (data) {
      angular.copy(data, postFactory.posts);
    }).error(function (data, status) {
      console.log("Couldn't retrieve data, " + status + ': ' + data);
    });
  };
  
  postFactory.findById = function(id) {
    return postFactory.posts.filter(function(val) {
      return val._id == id;
    })[0];
  }

  postFactory.create = function (post) {
    $http.post('/posts', post).success(function (post) {
      postFactory.posts.push(post);
    })
  }

  postFactory.upvote = function (post) {
    return $http.put('/posts/' + post._id + '/upvote')
      .success(function (data) {
        post.upvotes = data.upvotes;
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
  }

  postFactory.loadComments = function (post) {
    $http.get('/posts/' + post._id + '/comments').success(function (data) {
      post.comments = data;
    });
  }

  return postFactory;
}]);

app.factory('auth', ['$http', '$window', function ($http, $window) {
  var auth = {};
  
  auth.updateHeaders = function() {
    $http.defaults.headers.common.Authorization = 'Bearer ' + $window.localStorage['flapper-news-token'];
  };

  auth.saveToken = function (token) {
    $window.localStorage['flapper-news-token'] = token;
    auth.updateHeaders();
  };

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
      auth.saveToken(token.token);
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

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['postFactory', function (postFactory) {
          return postFactory.getAll();
        }]
      }
    }).state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostCtrl'
    }).state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthController',
      onEnter: ['$state', 'auth', function ($state, auth) {
        if (auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    }).state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthController',
      onEnter: ['$state', 'auth', function ($state, auth) {
        if (auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    });
    
  $urlRouterProvider.otherwise('/home');
}]);

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

app.controller('AuthController', ['$scope', '$state', 'auth', function ($scope, $state, auth) {
  $scope.user = {};

  $scope.register = function () {
    if ($scope.user.password !== $scope.user.repeatPassword) {
      $scope.error = { message: "Passwords are not the same" };
      return;
    }
    
    auth.register($scope.user).error(function (error) {
      $scope.error = error;
    }).then(function () {
      auth.updateHeaders();
      $state.go('home');
    });
  };

  $scope.login = function () {
    auth.login($scope.user).error(function (error) {
      $scope.error = error;
    }).then(function () {
      auth.updateHeaders();
      $state.go('home');
    });
  }
}]);

app.controller('NavController', ['$scope', 'auth', '$state', function ($scope, auth, $state) {
  
  $scope.isLoggedIn = auth.isLoggedIn;
  
  $scope.currentUser = auth.currentUser;
  
  $scope.logOut = function() {
    auth.logout();
    $state.go('login');
  };
  
}]);