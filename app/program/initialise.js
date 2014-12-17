(function() {
    "use strict";

    var BR = Object.create(null);
    this.BR = BR;

}).call(this);

angular.module("BR", [])
    .service("BR", [
        "$window",
        function($window) {
            this.entities = $window.BR.track.entities;
        }
    ])
    .directive("brMenu", function() {
        return {
            restrict: "E",
            templateUrl: "templates/menu.tpl.html",
            controller: "MenuController"
        };
    })
    .controller("MenuController", [
        "$scope", "$window",
        function($scope, $window) {
            $scope.model = {
                paused: false,
                speed: 710,
                show_dead: false
            };

            $scope.$watch("model.paused", function(n, o) {
                if (o !== void 0) {
                    if (n) {
                        $window.BR.engine.lock();
                    } else {
                        $window.BR.engine.unlock();
                    }
                }
            });

            $scope.$watch("model.speed", function(n) {
                if (n) {
                    $window.BR.ROT.timeout = 1010 - (n * 10);
                }
            });
        }
    ])
    .directive("brConsole", function() {
        return {
            restrict: "E",
            templateUrl: "templates/console.tpl.html",
            controller: "ConsoleController"
        };
    })
    .controller("ConsoleController", [
        "$scope", "BR",
        function($scope, BR) {
            $scope.model = {
                entities: BR.entities
            };

            $scope.get_not_dead = function() {
                return ($scope.model.entities || []).filter(function(e) {
                    return !e.is_dead;
                });
            };

            $scope.on_mouseover = function(entity) {
                entity.$$bg = entity.representation.color.bg;
                entity.representation.color.bg = "#fff";
                entity.draw();
            };
            $scope.on_mouseout = function(entity) {
                entity.representation.color.bg = entity.$$bg;
                entity.draw();
            };
        }
    ]);
