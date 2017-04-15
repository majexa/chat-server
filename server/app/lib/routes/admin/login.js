module.exports = function(server) {
  server.app.get('/admin', function(req, res) {
    res.send('<form method="post" action="/admin/auth"><p>Admin Password:<br><input type="password" name="password"></p><input type="submit"></form>');
  });

  server.app.post('/admin/auth', function(req, res) {
    if (req.body.password == server.config.adminPassword) {
      req.session.admin = true;
      res.redirect('/admin/users');
    } else {
      res.send('wrong. <a href="javascript:history.back()">back</a>');
    }
  });

  server.app.get('/admin/logout', function(req, res) {
    delete req.session.admin;
    res.redirect('/admin/users');
  });

};