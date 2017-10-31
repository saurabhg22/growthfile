angular.module("mainController", [])

.controller('mainCtrl', function($rootScope, $http, $location, $timeout, $window){
      

    var app = this;
    app.loaded = true;
    app.appLoaded = false;
    $rootScope.$on('$routeChangeStart', function(){
        app.successMsg = false;
        app.errorMsg = false;

        if($window.localStorage.getItem('token')){
            app.getUser().then(function(data){
                app.name = data.data.name;
                app.email = data.data.email;
                app.isLoggedIn = true;
                app.appLoaded = true;
            })
        }
        else{
            app.name = '';
            app.email = '';
            app.isLoggedIn = false;
            app.appLoaded = true;
        }
    });


    app.loginUser = function(loginData){
        app.loaded = false;
        app.successMsg = false;
        app.errorMsg = false;

        $http.post('/login', loginData).then(function(data){
            if(data.data.success){
                app.successMsg = data.data.message + " Redirecting to home...";
                $window.localStorage.setItem('token', data.data.token);
                app.errorMsg = false;
                $timeout(function(){
                    $location.path('/');
                }, 2000);
            }
            else{
                app.errorMsg = data.data.message;
                app.successMsg = false;
            }
            app.loaded = true;
        });
    }
    app.logOut = function(loginData){
        $window.localStorage.removeItem('token');
        $location.path('/logout');
        $timeout(function(){
            $location.path('/');
        }, 2000);
    }

    app.getUser = function(){
        if($window.localStorage.getItem('token')){
            return $http.post('/me');
        }
        else{
            $q.reject({message: "User has no token."});
        }
    }


})



.factory("AuthInterceptors", function($window){
    var authInterceptorsFactory = {};
    authInterceptorsFactory.request = function(config){
        var token = $window.localStorage.getItem('token');
        if(token){
            config.headers['x-access-token'] = token;
        }

        return config;
    }

    return authInterceptorsFactory;
})