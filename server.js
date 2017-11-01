var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var User = require("./app/models/user");
var jwt = require('jsonwebtoken');
var port = process.env.PORT || 8080;
var host = process.env.HOST || "htttp://localhost";
console.log(process.env);
var secret = "Shall we begin?";

var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
console.log("ADDRESSES");
console.log(addresses);
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


var options = {
    service: 'SendGrid',
    auth: {
      api_user: 'saurabhg22',
      api_key: 'grow1234'
    }
  }

var client = nodemailer.createTransport(sgTransport(options));


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb://saurabh:grow1234@cluster0-shard-00-00-mydlt.mongodb.net:27017,cluster0-shard-00-01-mydlt.mongodb.net:27017,cluster0-shard-00-02-mydlt.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin", function(err){
    if(err){
        console.log("Not connected to the database!!!");
    }
    else{
        console.log("Successfully connected to the database.");
    }
});



app.post('/users', function (req, res) {
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    if( emptyEx(user.name, user.email, user.password)){
        res.json({
            success:false, 
            message:"Ensure fullname, email and password are provided."
        });
    }
    else{
        user.save(function(err){
            if(err){
                res.json({
                    success:false, 
                    message:"Email-Id already registered."
                });
            }
            else{
                res.json({
                    success:true, 
                    message:"Successfuly registered."
                });
            }
        });
    }

});



app.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    if( emptyEx(email, password)){
        res.json({
            success:false, 
            message:"Ensure email and password are provided."
        });
    }
    else{
        User.findOne({email:email}).select("name email password").exec(function(err, user){
            if (err){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
                throw err;
            }
            else{
                if(!user){
                    res.json({
                        success:false, 
                        message:"Could not authenticate user."
                    });
                }
                else if(user){
                    if(user.comparePassword(password)){
                        var token = jwt.sign({
                                name: user.name,
                                email: user.email
                            }, 
                            secret, { expiresIn: '24h' });
                        res.json({
                            success:true, 
                            message:"Successfuly logged in.",
                            token: token
                        });
                    }
                    else{
                        res.json({
                            success:false, 
                            message:"Email or Password does not match."
                        });
                    }
                }
            }
        });
    }

});



app.put('/sendPasswordResetLink', function (req, res) {
    var email = req.body.email;
    if(emptyEx(email)){
        res.json({
            success:false, 
            message:"Please provide your email address."
        });
    }
    else{
        User.findOne({email:email}).select("name").exec(function(err, user){
            if (err){
                res.json({
                    success:false, 
                    message:"Email not registered."
                });
                throw err;
            }
            else{
                if(!user){
                    res.json({
                        success:false, 
                        message:"Email not registered."
                    });
                }
                else if(user){
                    user.resetToken = jwt.sign({
                            name: user.name,
                            email: user.email
                        }, 
                        secret, { expiresIn: '24h' });

                    user.save(function(err){
                        if(err){
                            res.json({
                                success:false, 
                                message:"Something went wrong, please wait 2 minutes then refresh the browser and try again."
                            });
                        }
                        else{
                            var Email = {
                                from: 'Growthfile, staff@growthfile.com',
                                to: email,
                                subject: 'Growthfile Password Reset Link',
                                text: "Hello, " + user.name + " you recently requested a password reset link. Please follow the link below to reset your password.\n\nhttp://localhost:" + port + "/reset/" + user.resetToken,
                                html: "Hello, <strong>" + user.name + "</strong> you recently requested a password reset link. Please follow the link below to reset your password.<br><br><a href=\"http://localhost:" + port + "/reset/" + user.resetToken + "\">http://localhost:" + port + "</a>"
                            };
                            
                            client.sendMail(Email, function(err, info){
                                if (err ){
                                    res.json({
                                        success:false, 
                                        message:"Something went wrong, please wait 2 minutes then refresh the browser and try again."
                                    });
                                }
                                else {                            
                                    res.json({
                                        success:true, 
                                        message:"Password reset link is sent to your email."
                                    });
                                }
                            });

                        }
                    });


                }
            }
        });

    }
});

app.get('/resetPassword/:token', function (req, res) {
    User.findOne({resetToken:req.params.token}).select('email name').exec(function(err, user){
        if(err) throw err;
        if(!user){
            res.json({
                success:false, 
                message:"Reset Password link has expired."
            });
        }
        else{
            var token = req.params.token;
            jwt.verify(token, secret, function(err, decoded){
                if(err){
                    res.json({
                        success:false, 
                        message:"Reset Password link has expired."
                    });
                }
                else{
                    res.json({
                        success:true, 
                        user:user
                    });
                }
            });
        }
    });
});


// Save user's new password to database
app.put('/savepassword', function(req, res) {
    User.findOne({ email: req.body.email }).select('email name password resettoken').exec(function(err, user) {
        if (err) {
            // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
            var Email = {
                from: 'Growthfile, staff@growthfile.com',
                to: 'saurabhg22596@gmail.com',
                subject: 'Error Logged',
                text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
            };
            // Function to send e-mail to myself
            client.sendMail(Email, function(err, info) {
                if (err) {
                    console.log(err); // If error with sending e-mail, log to console/terminal
                } else {
                    console.log(info); // Log success message to console if sent
                    console.log(user.email); // Display e-mail that it was sent to
                }
            });
            res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
        } else {
            if (emptyEx(req.body.newPassword)) {
                res.json({ success: false, message: 'Password not provided' });
            } else {
                if(!user){
                    res.json({ success: false, message: 'Reset Password link has expired.' });
                }
                else{
                    user.password = req.body.newPassword; // Save user's new password to the user object
                    user.resetToken = false; // Clear user's resettoken 
                    // Save user's new data
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            // Create e-mail object to send to user
                            var Email = {
                                from: 'Growthfile, staff@growthfile.com',
                                to: user.email,
                                subject: 'Password Recently Reset',
                                text: 'Hello ' + user.name + ', This e-mail is to notify you that your password was recently reset at Growthfile',
                                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at Growthfile'
                            };
                            // Function to send e-mail to the user
                            client.sendMail(Email, function(err, info) {
                                if (err) console.log(err); // If error with sending e-mail, log to console/terminal
                            });
                            res.json({ success: true, message: 'Password has been reset!' }); // Return success message
                        }
                    });
                }
            }
        }
    });
});


app.get('*', function(req,res){
    console.log("REQUEST");
    console.log(req);
    res.sendFile(path.join(__dirname + "/public/app/index.html"));
});

app.use(function(req, res, next){
    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    if(emptyEx(token)){
        res.json({
            success:false, 
            message:"No token provided."
        });
    }
    else{
        jwt.verify(token, secret, function(err, decoded){
            if(err){
                res.json({
                    success:false, 
                    message:"Invalid Token!!!"
                });
            }
            else{
                req.decoded = decoded;
                next();
            }
        });
    }
});

app.post('/me', function (req, res) {
    res.send(req.decoded);
});


app.listen(port, function(){
    console.log("Running the server on port:", port);
});

function emptyEx(){
    var cond = false;
    for (var i = 0; i < arguments.length; i++){
        cond = cond || (arguments[i] == null || arguments[i] == '');
    }
    return cond;
}
