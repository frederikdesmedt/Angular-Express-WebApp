angular.module('flapperNews').directive('username', function () {
  return {
    link: function (scope, elm, attrs) {
      elm[0].onblur = function() {
        scope.$apply(function() {
          scope.checkUsername();
        });
      };
    }
  };
});