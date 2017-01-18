# cpu, memory, GC, mongo size, folder size
module.exports =

  startCollecting: (server) ->
    getSize = require 'get-folder-size'
    setInterval ->
      getSize server.config.appFolder + '/public/uploads', (err, uploadsSize) ->
        server.db.stats (err, dbStat)->
          server.db.collection('stat').insert
            time: new Date().getTime()
            memory: process.memoryUsage().rss
            cpu: process.cpuUsage().user
            dbSize: dbStat.dataSize
            uploadsSize: uploadsSize
    , 60000 * 10
    setInterval ->
      server.db.collection('users').count {
        status: 'online'
      }, (err, onlineCount) ->
        server.db.collection('users').count (err, usersCount) ->
          server.db.collection('usersStat').insert
            time: new Date().getTime()
            onlineCount: onlineCount
            usersCount: usersCount
    , 60000 * 60 * 24

  titles:
    memory: 'Memory'
    cpu: 'CPU'
    dbSize: 'Database Size'
    uploadSize: 'Uploads folder size'
  userTitles:
    onlineCount: 'Online Users'
    usersCount: 'Registered Users'

  adminResultHandler: (db, req, res) ->
    db.collection('stat').find().sort({
      time: -1
    }).limit(20).toArray(((err, records)->
      db.collection('usersStat').find().sort({
        time: -1
      }).limit(7).toArray(((err, userRecords)->
        if !records && !userRecords
          console.log 'no stat'
          return
        records = records.reverse()
        userRecords = userRecords.reverse()
        charts = []
        for key of @titles
          charts.push @formatChartData(key, records, @titles)
        userCharts = []
        for key of @userTitles
          userCharts.push @formatChartData(key, userRecords, @userTitles)
        #res.header 'Access-Control-Allow-Origin', '*'
        res.send {
          charts: charts,
          userCharts: userCharts
        }
      ).bind(@))
    ).bind(@))

  tts: (timestamp) ->
    date = new Date(timestamp);
    hours = date.getHours();
    minutes = "0" + date.getMinutes();
    formattedTime = hours + ':' + minutes.substr(-2)
    return formattedTime

  formatChartData: (key, records, titles) ->
    json =
      title: titles[key]
      lables: []
      data: []
    i = 0
    for v in records
      i++
      json.lables.push @tts(v.time)
      json.data.push v[key]
    return json

