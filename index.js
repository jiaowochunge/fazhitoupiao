const { getCachedResult, storeCache } = require('./simpleCache')
const express = require('express')
const mysql = require('mysql')
const argv = require('minimist')(process.argv.slice(2))

const { u: user, p: password, database } = argv
if (!user || !password) {
	console.log('usage: node index.js -u "username" -p "password" -database "dbname"')
	process.exit(1)
}

const app = express()
const port = 3000

const statSQL = `select count(*) as count, mins from (select concat(date_format(created_at,'%Y-%m-%d %H:'), rpad(floor(minute(created_at) / 10) * 10, 2, 0)) as mins from fazhi_toupiao where vote_content like ?) as t group by mins;`

let connection = null
function handleConnect() {
	connection = mysql.createConnection({
		host: 'localhost',
		user: user,
		password: password,
		database: database || 'wx_test'
	})
	connection.connect()

	connection.on('error', function(err) {
    console.log('db error', err)
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleConnect()
    } else {
      throw err
    }
  })
}
handleConnect()

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

	connection.query(statSQL, [`%${key}%`], (err, result) => {
		if (err) {
			next(err)
			return
		}

		storeCache(key, result)
		res.header('Cache-Control', 'public, max-age=604800, immutable');
		res.json(result)
	})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})