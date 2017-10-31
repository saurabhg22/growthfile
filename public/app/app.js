angular.module("userApp", ["appRoutes", "userController", "mainController"])

.config(function($httpProvider){
    $httpProvider.interceptors.push("AuthInterceptors");
})