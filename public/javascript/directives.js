angular.module('flapperNews').directive('username', function () {
  return {
    scope: {
      error: "="
    },
    link: function (scope, elm, attrs) {
      elm[0].onblur = function () {
        scope.$apply(function () {
          scope.$parent.checkUsername(function (response) {
            scope.error.taken = response.taken;
          });
        });
      };
    }
  };
});