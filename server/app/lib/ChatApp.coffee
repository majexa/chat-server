class ChatApp

  constructor: (@config) ->

  start: ->
    @initApp()
    @initMongo()
    @startHttp()

  initApp: ->
    @express = require 'express'
    @path = require 'path'
    @bodyParser = require 'body-parser'

    @app = @express()

    cors = require 'cors'
    @app.use(cors())

    @app.use @bodyParser.urlencoded
      extended: true

    @app.set 'view engine', 'jade'
    @app.set 'views', @path.normalize @config.appFolder + '/../views'
    @app.use @express.static @path.join @config.appFolder, 'public'
    @app.get '/', ((req, res) ->
      res.sendFile(@config.appFolder + '/index.html')
    ).bind(@)
    @http = require('http').Server(@app)

  initMongo: (onInit) ->
    @connectMongo(((db)->
      @initLogger(db)
      require('./cAdminApp')(@, db)
      Server = require('./Server')
      server = new Server(@config, @app, db, require('socket.io')(@http), require('jsonwebtoken'))
      if onInit
        onInit(server)
    ).bind(@))
    @initSession(@app)

  initLogger: (db) ->
    return
    logger = (req, res, next) ->
      if !req.url.match(/\/api.*/)
        next()
        return
      oldWrite = res.write
      oldEnd = res.end
      chunks = []
      res.write = (chunk) ->
        chunks.push(chunk)
        oldWrite.apply(res, arguments)
      res.end = (chunk) ->
        console.log(chunk)
        if (chunk)
          chunks.push(chunk);
        console.log(chunks)
        body = Buffer.concat(chunks).toString('utf8');
        db.collection('logs').insertOne({
          dt: new Date(),
          url: req.url,
          code: res.statusCode,
          body: body
        })
        oldEnd.apply(res, arguments)
      next()
    @app.use logger

  connectMongo: (onConnect) ->
    @mongoUrl = 'mongodb://localhost:27017/' + @config.dbName
    mongodb = require 'mongodb'
    mongoClient = mongodb.MongoClient
    mongoClient.connect @mongoUrl, ((err, db) ->
      console.log 'mongo connected'
      db.ObjectID = (id) ->
        if typeof id == 'string'
          return mongodb.ObjectID(id)
        else
          return id
      onConnect(db)
    ).bind(@)

  initMongoStore: ->
    if @mongoStore
      return
    @session = require 'express-session'
    MongoStore = require('connect-mongo')(@session)
    @mongoStore = new MongoStore
      db: @config.dbName
      host: '127.0.0.1'
      port: 27017
      collection: 'session'
      auto_reconnect: true
      url: @mongoUrl

  initSession: (app) ->
    @initMongoStore()
    app.use @session
      cookie: {maxAge: 1000 * 60 * 60 * 30}
      secret: "the_session_secret"
      store: @mongoStore

  startHttp: ->
    @http.listen @config.port, (->
      console.log 'listening on *:' + @config.port
    ).bind(@)

module.exports = ChatApp