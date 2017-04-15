var Pagination = require('../../Pagination');

module.exports = function(app, db) {

  app.param('userId', function(req, res, next, userId) {
    db.collection('users').findOne({
      _id: db.ObjectID(userId)
    }, function(err, user) {
      if (err) return next(err);
      if (!user) return next({error: 'no error'});
      req.user = user;
      next()
    });
  });

  app.get('/admin/users', function(req, res) {
    if (!req.session || !req.session.admin) {
      res.status(404).send('access denied. <a href="/admin">auth</a>');
      return;
    }
    res.render('admin/user/list');
  });

  var getItemsRequest = function(req, res) {
    // if (!req.session || !req.session.admin) {
    //   res.status(404).json({error: 'access denied'});
    //   return;
    // }
    var head = ['ID', 'Phone', 'Login', 'Status'];
    var pagination = new Pagination({
      basePath: '/admin/users/json_getItems'
    });
    db.collection('users').count(function(err, count) {
      var paginationData = pagination.data(req, count);
      db.collection('users').find().skip(pagination.options.n * (paginationData.page - 1)).limit(pagination.options.n)
        .toArray().then(function(users) {
        var data = {};
        data.head = head;
        data.body = [];
        for (var i = 0; i < users.length; i++) {
          var item = {
            id: users[i]._id,
            tools: {
              delete: 'Delete',
              edit: 'Edit'
            },
            data: {
              id: users[i]._id,
              phone: users[i].phone,
              login: users[i].login || '',
              status: users[i].status
            }
          };
          data.body.push(item);
        }
        data.pagination = paginationData;
        res.json(data);
      });
    });
  };

  app.get('/admin/users/json_getItems', function(req, res) {
    getItemsRequest(req, res);
  });

  app.get('/admin/users/json_getItems/pg:pg', function(req, res) {
    getItemsRequest(req, res);
  });

  app.get('/admin/users/asd', function(req, res) {
    app.render('admin/user/stat', {
      phone: '',
      login: '',
      password: ''
    }, function(err, html) {
      if (err) throw new Error(err);
      console.log(html);
      res.json({
        form: html,
        title: 'Create User'
      });
    });
  });
  app.get('/admin/users/json_new', function(req, res) {
    // if (!req.session || !req.session.admin) {
    //   res.status(404).json({error: 'access denied'});
    //   return;
    // }
    app.render('admin/user/form', {
      phone: '',
      login: '',
      password: ''
    }, function(err, html) {
      console.log(html);
      res.json({
        form: html,
        title: 'Create User'
      });
    });
  });

  app.post('/admin/users/json_new', function(req, res) {
    // if (!req.session || !req.session.admin) {
    //   res.status(404).json({error: 'access denied'});
    //   return;
    // }
    db.collection('users').insertOne({
      login: req.body.login,
      phone: req.body.phone,
      password: req.body.password
    }, function() {
      res.send('null');
    });
  });

  app.get('/admin/users/json_edit', function(req, res) {
    // if (!req.session || !req.session.admin) {
    //   res.status(404).json({error: 'access denied'});
    //   return;
    // }
    db.collection('users').findOne({
      _id: db.ObjectID(req.query.id)
    }, function(err, user) {
      if (!user) {
        res.status(404).send({error: 'no user'});
        return;
      }
      app.render('admin/user/form', user, function(err, html) {
        res.json({
          form: html,
          title: 'Edit User'
        });
      });
    });
  });

  app.post('/admin/users/json_edit', function(req, res) {
    // if (!req.session || !req.session.admin) {
    //   res.status(404).json({error: 'access denied'});
    //   return;
    // }
    db.collection('users').update({_id: db.ObjectID(req.query.id)}, {
      $set: {
        login: req.body.login,
        phone: req.body.phone,
        password: req.body.password
      }
    }, function(err, result) {
      if (result) {
        res.send('null');
      } else {
        res.json({error: 'user not found'});
      }
    });
  });

  app.get('/admin/users/ajax_delete', function(req, res) {
    // if (!req.session || !req.session.admin) {
    //   res.status(404).send('access denied');
    //   return;
    // }
    db.collection('users').remove({
      _id: db.ObjectID(req.query.id)
    });
    res.send('null');
  });

};