var ChatActions = require('../../actions/ChatActions');

module.exports = function (server) {

  /**
   * @api {get} /user/info Get user info
   * @apiName GetUserInfo
   * @apiGroup User
   *
   * @apiParam {Number} phone User phone (OR id)
   * @apiParam {Number} id User ID (OR phone)
   *
   * @apiSuccess {String} user JSON with user info
   *
   * @apiErrorExample Error-Response:
   *   HTTP/1.1 404 Not Found
   *   {"error": "error message"}
   */
  server.app.get('/api/v1/user/info', function (req, res) {
    server.addApiCors(res);
    if (!req.query.phone && !req.query.id) {
      res.status(404).send({error: 'use phone or id get param'});
      return;
    }
    var done = function (err, user) {
      if (!user) {
        res.status(404).send({error: 'no user'});
        return;
      }
      res.send(user);
    };
    // ...
    var includeFields = {
      _id: 1,
      login: 1,
      phone: 1
    };
    if (req.query.id) {
      server.db.collection('users').findOne({
        _id: server.db.ObjectID(req.query.id)
      }, includeFields, done);
    } else {
      server.db.collection('users').findOne({
        phone: req.query.phone
      }, includeFields, done);
    }
  });

  /**
   * @api {get} /user/update Update user
   * @apiName Update
   * @apiGroup User
   *
   * @apiParam {String} token JWT token
   * @apiParam {String} login Login
   * @apiParam {String} phone Phone
   * @apiParam {String} name Name
   * @apiParam {String} surname Surname
   *
   * @apiSuccess {String} success The string "success" on success
   *
   * @apiErrorExample Error-Response:
   *   HTTP/1.1 404 Not Found
   *   {"error": "error message"}
   */
  server.app.get('/api/v1/user/update', function (req, res) {
    var clean = function (obj) {
      for (var propName in obj) {
        if (!obj[propName]) {
          delete obj[propName];
        }
      }
    };
    server.tokenReq(req, res, function (res, user) {
      var data = req.query;
      delete data.token;
      clean(data);
      server.db.collection('users').update({_id: server.db.ObjectID(user._id)}, {$set: data}, function (err, count) {
        if (count) res.json({success: 1}); else res.json({error: 'user not found'});
      });
    });
  });

  /**
   * @api {post} /user/upload Upload photo
   * @apiName Upload photo
   * @apiDescription <a href="http://chat.311.su:8080/test/upload/user.html">Web example</a>
   * @apiGroup User
   *
   * @apiParam {String} token JWT token
   * @apiParam {File} image Image (File via multipart/form-data)
   *
   * @apiSuccess {String} filename File accessible by url HOST/uploads/user/{filename}
   */
  var formidable = require('formidable');
  var fs = require('fs');
  server.app.post('/api/v1/user/upload', function (req, res) {
    server.tokenReq(req, res, function (res, user) {
      var fileName = user._id;
      var form = new formidable.IncomingForm();
      form.uploadDir = server.path.join(server.config.appFolder, '/public/uploads/user');
      form.on('file', function (field, file) {
        fs.rename(file.path, server.path.join(form.uploadDir, fileName));
      });
      form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
      });
      form.on('end', function () {
        res.end(fileName);
      });
      form.parse(req);
    });
  });

  /**
   * @api {get} /user/chats User chats
   * @apiName Get user chats
   * @apiGroup User
   *
   * @apiParam {String} token JWT token
   *
   * @apiSuccess {String} JSON with chats list
   */
  server.app.get('/api/v1/user/chats', function (req, res) {
    server.tokenReq(req, res, function (res, user) {
      (new ChatActions(server.db)).getByUser(user._id, function (r) {
        res.send(r);
      });
    });
  });

  /**
   * @api {get} /user/check Check user token
   * @apiName Check user token
   * @apiGroup User
   *
   * @apiParam {String} token JWT token
   */
  server.app.get('/api/v1/user/check', function (req, res) {
    server.tokenReq(req, res, function (res, user) {
      res.send(user);
    });
  });

  /**
   * @api {get} /user/updateDeviceToken Update device token
   * @apiName Updates device token
   * @apiGroup User
   *
   * @apiParam {String} token JWT token
   * @apiParam {String} deviceToken Device token
   */
  server.app.get('/api/v1/user/updateDeviceToken', function (req, res) {
    server.tokenReq(req, res, function (res, user) {
      if (!req.query.deviceToken) {
        res.status(404).send({error: 'deviceToken not defined'});
        return;
      }
      var data = {
        deviceToken: req.query.deviceToken
      };
      server.db.collection('users').update({_id: server.db.ObjectID(user._id)}, {$set: data}, function (err, count) {
        if (count) res.json({success: 1}); else res.json({error: 'user not found'});
      });
    });
  });

  var refreshToken = function (user) {
    var optionKeys = ['iat', 'exp', 'iss', 'sub'];
    var newToken;
    var obj = {};
    for (var key in user) {
      if (!user.hasOwnProperty(key)) continue;
      if (optionKeys.indexOf(key) === -1) {
        obj[key] = user[key];
      }
    }
    var jwt = require('jsonwebtoken');
    var config = require('../../../config');
    newToken = jwt.sign(obj, config.jwtSecret, {
      expiresIn: '7 days'
    });
    return newToken;
  };


  /**
   * @api {get} /user/updateToken Update user token
   * @apiName Updates user token
   * @apiGroup User
   *
   * @apiParam {String} token JWT token
   */
  server.app.get('/api/v1/user/updateToken', function (req, res) {
    server.tokenReq(req, res, function (res, user) {
      res.json({newToken: refreshToken(user)});
    });
  });

};