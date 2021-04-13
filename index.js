const { getCachedResult, storeCache } = require('./simpleCache')
const express = require('express')
const basicAuth = require('express-basic-auth')
const mysql = require('mysql')
const argv = require('minimist')(process.argv.slice(2))
const authUsers = require('./auth-users.json')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')

const port = 3000

const { u: user, p: password, database } = argv
if (!user || !password) {
  console.log('usage: node index.js -u "username" -p "password" -database "dbname"')
  process.exit(1)
}

const app = express()
app.use(basicAuth({
  users: authUsers,
  challenge: true,
  realm: 'Imb4T3st4ppXN'
}))

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))

const statSQL = `select count(*) as count, mins from (select concat(date_format(created_at,'%Y-%m-%d %H:'), rpad(floor(minute(created_at) / 10) * 10, 2, 0)) as mins from fazhi_toupiao where vote_content like ?) as t group by mins;`

const pool  = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user,
  password,
  database: database || 'wx_test'
})

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/stat', (req, res, next) => {
  const query = req.query
  const key = query.q
  if (!key || key.length < 2) {
    next(new Error('too short to search'))
  }

  const cachedResult = getCachedResult(key)
  if (cachedResult) {
    res.json(cachedResult)
    return
  }

  pool.query(statSQL, [`%${key}%`], (err, result) => {
    if (err) {
      next(err)
      return
    }

    storeCache(key, result)
    res.header('Cache-Control', 'public, max-age=604800, immutable');
    res.header('Content-Type', 'text/plain; charset=UTF-8');
    res.json(result)
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
