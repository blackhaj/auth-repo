const Session = require('../models/sessionModel');

const sessionController = {};

/**
* isLoggedIn - find the appropriate session for this request in the database, then
* verify whether or not the session is still valid.
*/
sessionController.isLoggedIn = (req, res, next) => {
  const cookie = req.cookies.ssid
  console.log(req.cookies)
  Session.findOne({cookieId : cookie}, (err, res) => {
    if (!res){
      return next(err)
    }
    else {
      return next()
    }
  })
};

/**
* startSession - create and save a new Session into the database.
*/
sessionController.startSession = (req, res, next) => {
  Session.create({ cookieId : res.locals.id })
  return next();
};


module.exports = sessionController;
