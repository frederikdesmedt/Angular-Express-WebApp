var app = angular.module("flapperNews", ['ui.router']);

app.controller("MainCtrl", [
  "$scope", "postFactory", function($scope, postFactory) {
    $scope.posts = postFactory.posts;

    $scope.addPost = function() {
      postFactory.create({
        title: $scope.title,
        link: $scope.link
      });

      $scope.link = "";
      $scope.title = "";
    }

    $scope.incrementUpvotes = function(post) {
      postFactory.upvote(post);
    };
  }]);

app.factory("postFactory",['$http', function($http) {
  var postFactory = {
    posts: []
  };

  postFactory.getAll = function() {
    $http.get('/posts').success(function(data) {
      angular.copy(data, postFactory.posts);
    }).error(function(data, status) {
      console.log("Couldn't retrieve data, " + status + ': ' + data);
    });
  };

  postFactory.create = function(post) {
    $http.post('/posts', post).success(function(post) {
      postFactory.posts.push(post);
    })
  }

  postFactory.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote')
              .success(function(data) {
                post.upvotes = data.upvotes;
              });
  }

  postFactory.upvoteComment = function(comment) {
    return $http.put('/posts/' + comment._id + '/upvote').success(function(data){
      comment.upvotes = data.upvotes;
    });
  };

  postFactory.addComment = function(post, comment) {
    $http.post('/posts/' + post._id + '/comment', comment).success(function(data) {
      post.comments.push(data);
    });
  }

  postFactory.loadComments = function(post) {
    $http.get('/posts/' + post._id + '/comments').success(function(data) {
      post.comments = data;
    });
  }

  return postFactory;
}]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: ['postFactory', function(postFactory) {
            return postFactory.getAll();
          }]
        }
      }).state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostCtrl'
      });

      $urlRouterProvider.otherwise('/home');
}]);

app.controller("PostCtrl", [
  "$scope", "$stateParams", '$http', "postFactory", function($scope, $stateParams, $http, postFactory) {
    $scope.post = postFactory.posts[$stateParams.id];
    postFactory.loadComments($scope.post);

    $scope.incrementUpvotes = function(comment) {
      postFactory.upvoteComment(comment);
    };

    $scope.addComment = function() {
      if($scope.body === '') { return; }

      postFactory.addComment(postFactory.posts[$stateParams.id], {
        author: 'User',
        body: $scope.body,
        upvotes: 0
      });
    }
}]);
