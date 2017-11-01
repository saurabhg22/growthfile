angular.module('userController', [])

.controller("regCtrl", function($http, $timeout, $location){
    
    var app = this;
    app.loaded = true;
    app.regUser = function(regData){
        app.loaded = false;
        app.successMsg = false;
        app.errorMsg = false;

        $http.post('/users', regData).then(function(data){
            if(data.data.success){
                app.successMsg = data.data.message + " Redirecting to home...";
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

})

.controller("resetTokenCheckCtrl", function($http, $routeParams, $scope, $timeout, $location){

    var app = this;
    app.loaded = true;
    app.hide = true;
    app.successMsg = false;
    app.errorMsg = false;

    $http.get("/resetPassword/"+$routeParams.token).then(function(data){

        if (data.data.success) {
            app.hide = false; 
            $scope.email = data.data.user.email; 
            app.errorMsg = false;
        } else {
            app.errorMsg = data.data.message;
            app.successMsg = false;
            app.hide = true;
        }
    });

    app.resetPassword = function(newPassword){
        app.loaded = false;
        app.successMsg = false;
        app.errorMsg = false;
        console.log("data.data");
        var newData = {email:$scope.email, newPassword:newPassword};
        $http.put('/savepassword', newData).then(function(data){
            console.log(data.data);
            if(data.data.success){
                app.successMsg = data.data.message  + " Redirecting to login page....";
                app.errorMsg = false;
                
                $timeout(function(){
                    $location.path('/login');
                }, 2000);
            }
            else{
                app.errorMsg = data.data.message;
                app.successMsg = false;
            }
            app.loaded = true;
        });
    }


})


.controller("resetCtrl", function($http, $routeParams, $scope){
    var app = this;
    app.loaded = true;
    app.hide = true;
    app.successMsg = false;
    app.errorMsg = false;


    app.sendPasswordResetLink = function(email){
        console.log("data.data");
        app.loaded = false;
        app.successMsg = false;
        app.errorMsg = false;
        
        $http.put('/sendPasswordResetLink', {email:email}).then(function(data){
            if(data.data.success){
                app.successMsg = data.data.message;
                app.errorMsg = false;
            }
            else{
                app.errorMsg = data.data.message;
                app.successMsg = false;
            }
            app.loaded = true;
        });
    }



})
