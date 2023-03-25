require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require("passport-local-mongoose");

const path = require('path');

const staticPath = path.join(__dirname,"./public");

app.use(express.static(staticPath));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));

app.use(session({
    secret : "Our little secret.",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.authentication('session'));

mongoose.connect("mongodb://127.0.0.1:27017/ajay")
.catch((e)=>{
    console.log(e);
})

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('Registered_user',userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render('home');
})

app.get("/login",(req,res)=>{
    res.render('login');
});

app.get("/register",(req,res)=>{
    res.render('register');
});

app.post("/register", async (req,res)=>{

    // register() is a method comes from passport-local-mongoose
    User.register({username : req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets")
            })
        }
    })

});

app.get("/secrets", (req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.post("/login", async (req,res)=>{

    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    // login() comes from passport
    req.logIn(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets")
            })
        }
    });
});

app.get("/logout", (req,res)=>{

    req.logout(function(err) {
        if (err) 
        { console.log(err); 
        }else{
            res.redirect('/');
        }
      });
});

app.listen(4000, ()=>{
    console.log("Server started on port number 4000");
})

//During save, documents are encrypted and then signed. During find, documents are authenticated and then decrypted