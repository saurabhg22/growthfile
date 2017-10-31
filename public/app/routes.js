angular.module("appRoutes", ["ngRoute"])

.config(function($routeProvider, $locationProvider){

    $routeProvider
    
    .when('/', {
        templateUrl: 'app/views/home.html'
    })

    .when('/register', {
        templateUrl: 'app/views/reg.html',
        controller: 'regCtrl',
        controllerAs: 'register'
    })

    .when('/login', {
        templateUrl: 'app/views/login.html'
    })

    .when('/logout', {
        templateUrl: 'app/views/logout.html'
    })
    
    .when('/resetpassword', {
        templateUrl: 'app/views/resetPassword.html',
        controller: 'resetCtrl',
        controllerAs: 'reset'
    })


    .when('/reset/:token', {
        templateUrl: 'app/views/newPassword.html',
        controller: 'resetTokenCheckCtrl',
        controllerAs: 'reset'
    })
        
    .otherwise({
        templateUrl: 'app/views/404.html'
    });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});