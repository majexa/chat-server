module.exports = (chatApp, db) ->

  cAdminApp = chatApp.express()
  cAdminApp.use chatApp.bodyParser.urlencoded
    extended: true
  adminBasePath = chatApp.path.normalize(chatApp.config.appFolder + '/../../admin')

  chatApp.initSession(cAdminApp)

  cAdminApp.use(chatApp.express.static(adminBasePath + '/public'))
  cAdminApp.set('view engine', 'jade');
  cAdminApp.set('views', adminBasePath + '/views');
  cAdminApp.engine('html', require('ejs').renderFile);

  # auth
  cAdminApp.get '/auth', (req, res) ->
    res.render 'auth.html',
      error: null

  cAdminApp.post '/auth', (req, res) ->
    if !req.body.password
      res.render 'auth.html',
        error: 'Password required'
      return
    if req.body.password != chatApp.config.adminPassword
      res.render 'auth.html',
        error: 'Password required'
      return
    req.session.admin = true
    res.redirect '/'

  cAdminApp.get '/logout', (req, res) ->
    req.session.admin = false
    res.redirect '/auth'

  cAdminApp.use '/admin', (req, res, next) ->
    if !req.session.admin
      res.redirect '/auth'
      return
    next()

  cAdminApp.get '/', (req, res) ->
    res.redirect '/admin'

  cAdminApp.get '/admin', (req, res) ->
    res.render 'index.html',
      apiUri: chatApp.config.host + ':' + chatApp.config.port
      adminPassword: chatApp.config.adminPassword

  require('./routes/admin/users')(cAdminApp, db)
  require('./routes/admin/stat')(cAdminApp, db)
  require('./routes/admin/logs')(cAdminApp, db)

  adminHttp = require('http').Server(cAdminApp)
  adminHttp.listen chatApp.config.adminPort, (->
    console.log 'admin listening on *:' + chatApp.config.adminPort
  )
