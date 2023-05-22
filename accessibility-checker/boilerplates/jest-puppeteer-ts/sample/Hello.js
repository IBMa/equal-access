var app = angular.module("helloApp", ["ngMaterial","ngAria"], function config($ariaProvider) {
    $ariaProvider.config({
        bindRoleForClick: false
    });
});

app.controller("helloCtrl", function ($scope) {
    $scope.locale = "en-US";
    $scope.test = 1+2;
});
