module.exports = function(server) {

  /**
   * @api {get} /user/create Create user
   * @apiName Create
   * @apiGroup User
   *
   * @apiParam {Number} phone User Phone
   * @apiParam {String} login Login
   * @apiParam {String} password Password
   *
   * @apiSuccess {String} success The string "success" on success
   *
   * @apiErrorExample Error-Response:
   *   HTTP/1.1 404 Not Found
   *   {"error": "error message"}
   */
  server.app.get('/api/v1/user/create', function(req, res) {
    server.addApiCors(res);
    if (!req.query.phone) {
      res.status(404).json({error: 'phone is required'});
      return;
    }
    if (!req.query.login) {
      res.status(404).json({error: 'login is required'});
      return;
    }
    if (!req.query.password) {
      res.status(404).json({error: 'password is required'});
      return;
    }
    // check existence by phone
    server.db.collection('users').findOne({
      phone: req.query.phone
    }, function(err, user) {
      if (user) {
        res.status(404).send({error: 'user with a same phone already exists'});
        return;
      }
      // check existence by login
      server.db.collection('users').findOne({
        phone: req.query.login
      }, function(err, user) {
        if (user) {
          res.status(404).send({error: 'user with a same login already exists'});
          return;
        }
        // creation
        server.db.collection('users').insertOne({
          phone: req.query.phone,
          login: req.query.login,
          password: req.query.password
        });
        res.json({success: 1});
      });
    });
  });

};