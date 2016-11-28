module.exports = function(server) {

  var fakeTokenRequest = function(req, res, resCallback) {
    var user = {
      _id: '57e9120d8e2016833717515f',
      id: 79202560776,
      login: 'Anton',
      phone: '888',
      password: '888',
      status: 'offline',
      device: 'android',
      deviceToken: ''
    };
    resCallback(res, user);
  };

  /**
   * @api {get} /contacts/update Update contacts
   * @apiName UpdateContacts
   * @apiGroup Contacts
   *
   * @apiParam {String} token JWT token
   * @apiParam {Array} phones Phones separeted by quote ","
   *
   * @apiSuccess {String} json Existing contacts in recipient client list
   *
   */
  server.app.get('/api/v1/contacts/update', function(req, res) {
    server.tokenReq(req, res, function(res, user) {
      var phones = req.query.phones.split(',');
      var records = [];
      for (var i = 0; i < phones.length; i++) {
        records.push({
          userId: user._id,
          phone: phones[i]
        });
      }
      server.db.collection('contacts').insert(records, function(err, r) {
        server.db.collection('users').find({
          phone: {
            $in: phones
          }
        }, {
          _id: 1,
          phone: 1,
          login: 1
        }).toArray(function(err, users) {
          res.json(users);
          //console.log(users)
        })
      });
    });
  });

};