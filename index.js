const { getCachedResult, storeCache } = require('./simpleCache')
const express = require('express')
const app = express()
const port = 3000

const statSQL = `select count(*) as count, mins from (select concat(date_format(created_at,'%Y-%m-%d %H:'), rpad(floor(minute(created_at) / 10) * 10, 2, 0)) as mins from fazhi_toupiao where vote_content like ?) as t group by mins;`

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Siren123!',
  database: 'wx_test'
})
connection.connect()

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