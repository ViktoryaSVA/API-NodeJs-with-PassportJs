var db = require("../models");
var passport = require("../config/passport");
const jwt = require('jsonwebtoken');
const config = require("../config/config");
const tokenList = {}
const bodyParser = require('body-parser');

module.exports = function(app) {
  app.post("/api/login", passport.authenticate("local"), function(req, res) {
      const postData = req.body;
       const user = {
           "email": postData.email,
           "password": postData.password,
           "token": postData.token

       }
       // do the database authentication here, with user name and password combination.
       const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
       const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife})
       const response = {
           "status": "Logged in",
           "token": token,
           "refreshToken": refreshToken,
       }
       tokenList[refreshToken] = response
       res.status(200).json(response);
    res.json("/members");
  });

  app.post("/api/signup", function(req, res) {
    console.log(req.body);
    db.User.create({
      email: req.body.email,
      password: req.body.password,
      token: req.body.token,
    }).then(function() {
      res.redirect(307, "/api/login");
    }).catch(function(err) {
      console.log(err);
      res.json(err);
    });
  });

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      res.json({});
    }
    else {
      res.json({
        email: req.user.email,
        id: req.user.id,
        token: req.body.token,

      });
    }
  });
  app.use(require('./tokenCheck'))
  app.use(bodyParser.json())

};
