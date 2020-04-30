const User = require("../models/userModel");
const fetch = require("node-fetch");
const userController = {};

/**
 * getAllUsers - retrieve all users from the database and stores it into res.locals
 * before moving on to next middleware.
 */
userController.getAllUsers = (req, res, next) => {
  User.find({}, (err, users) => {
    // if a database error occurs, call next with the error message passed in
    // for the express global error handler to catch
    if (err)
      return next(
        "Error in userController.getAllUsers: " + JSON.stringify(err)
      );

    // store retrieved users into res.locals and move on to next middleware
    res.locals.users = users;
    return next();
  });
};

/**
 * createUser - create and save a new User into the database.
 */
userController.createUser = (req, res, next) => {
  // write code here
  if (
    typeof req.body["username"] === "string" &&
    typeof req.body["password"] === "string"
  ) {
    User.create(req.body, (err, newUser) => {
      if (err) {
        res.render("./../client/signup", { error: err });
        return next(
          "Error in userController.createUser: " + JSON.stringify(err)
        );
      }
      return next();
    });
  } else {
    return next("you screwed up");
  }
};

/**
 * verifyUser - Obtain username and password from the request body, locate
 * the appropriate user in the database, and then authenticate the submitted password
 * against the password stored in the database.
 */
userController.verifyUser = (req, res, next) => {
  User.findOne({ username: req.body["username"] }, (err, user) => {
    if (err || !user) {
      res.render("./../client/signup", { error: err });
      // return next('error in verifying user')
    } else {
      user.comparePassword(req.body["password"], (err, isCorrect) => {
        if (!isCorrect || err) {
          res.render("./../client/signup", { error: err });
        } else {
          res.locals.id = user.id;
          return next();
        }
      });
    }
  });
};

userController.getGithubToken = (req, res, next) => {
  // Process the query string getting code
  // POST code TO https://github.com/login/oauth/access_token
  fetch("https://github.com/login/oauth/access_token", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: "0e3729f48fc55f033aa2",
      client_secret: "66dceb376598bfab507d2d4ff6ce03c7d0288199",
      code: req.query.code,
    }),
  })
    .then((res) => res.json())
    .then((token) => {
      res.locals.id = token;
      return next();
    });
};

userController.getUserProfile = (req, res, next) => {
  console.log("this is the locals.id:", res.locals.id)
  
  fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${res.locals.id.access_token}`,
  }})
    .then((res) => res.json())
    .then((result) => {
      res.locals.profile = result;
      return next();
    });
};

module.exports = userController;
