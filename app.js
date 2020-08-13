const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://durvash:durvash123@cluster0.vugoz.mongodb.net/school?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = require('./models/users.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
var jwtKey = 'jwt-key-test';

app.get('/', function(req,res) {
    res.send('hello');
});

app.post('/register', jsonParser, function(req,res) {
    let encrypted = encrypt_string(req.body.password);
    const data = new User({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        password: encrypted,
        address: req.body.address
    });

    data.save().then((result)=> {
        jwt.sign({result}, jwtKey, {expiresIn:'300s'}, (err, token)=> {
            res.status(201).json({token});
        });
        // res.status(201).json(result);
    }).catch((err)=> {
        console.log(err);
    });
});

app.post('/login', jsonParser, function(req,res) {
    let encrypted = encrypt_string(req.body.password);
    // console.log(encrypted);
    User.findOne({email:req.body.email}).then((data)=> {
        if(encrypted == data.password) {
            jwt.sign({data}, jwtKey, {expiresIn:'300s'}, (err, token)=> {
                res.status(200).json({token});
            });
        }
    }).catch((err)=> {
        console.log(err);
    });
    // res.status(200).send(encrypted);
});

app.get('/users', verfiyToken, function(req,res) {
    User.find().then((data)=> {
        res.status(200).send(data);
    }).catch((err)=> {
        console.log(err);
    });
});

var encrypt_string = function(string) {
    return encryptedString = bcrypt.hashSync(string, '$2b$10$X4kv7j5ZcG39WgogSl16au');
}

//// Have a make middleware function to verify token passed via headers
function verfiyToken(req,res,next) {
    if(typeof req.headers.authorization !== 'undefined') {
        let token = req.headers.authorization;
        // res.send({"token":token});
        jwt.verify(token, jwtKey, (err, result)=> {
            if(err) {
                res.json({"data":err});
            } else {
                next();
            }
        });
    } else {
        res.send({"data":"Token not provided."});
    }
}

app.listen(5000);