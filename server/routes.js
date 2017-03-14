const pg = require('pg');
const shortid = require('shortid');

const pool = new pg.Pool({
	user: process.env.USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.TODO_DB,
	host: process.env.APP_HOST,
	max: 10, // max number of clients in pool
	idleTimeoutMillis: 1000,
	port: 5432
});

let querystring = '';
let uid;

module.exports = function(app){
	// routing
	// GET list of all todos
	app.get('/api/todos', (req, res) => {
		pool.connect((err, client, release) => {
			if (err) {
				throw err;
			}

			client.query('SELECT * FROM todos', (err, result) => {
				if (err) {
					throw err;
				}

				// was successful
				release();
				if(result && result.rows) {
					res.send(result.rows);
				}
			});
		});
	});

	// GET todo by id
	app.get('/api/todos/:id', (req, res) => {
		pool.connect((err, client, release) => {
			if (err) {
				throw err;
			}

			client.query(`SELECT * FROM todos WHERE id = ${req.params.id}`, (err, result) => {
				if (err) {
					throw err;
				}

				// was successful
				release();
				if(result && result.rows) {
					res.send(result.rows);
				}
			});
		});
	});

	// POST new todo
	app.post('/api/todos', (req, res) => {
		pool.connect((err, client, release) => {
			if (err) {
				throw err;
			}
			console.log('req.body');
			console.log(req.body);
			console.log('req.params');
			console.log(req.params);

			uid = shortid.generate();
			querystring = `INSERT INTO todos
				(id, title, iscomplete)
				VALUES ('${uid}', '${req.body.todoName}', ${false})
			`;

			client.query(querystring, (err, result) => {
				if (err) {
					throw err;
				}

				// was successful
				release();
				if(result && result.rows) {
					res.send('created todo');
				}
			});
		});
	});

	// UPDATE todo by id
	app.put('/api/todos/:id', (req, res) => {
		pool.connect((err, client, release) => {
			if (err) {
				throw err;
			}

			querystring = `UPDATE todos SET
				title = '${req.body.title || null}',
				iscomplete = '${req.body.iscomplete}'
				WHERE id = '${req.params.id}'
			`;

			client.query(querystring, (err, result) => {
				if (err) {
					throw err;
				}

				// was successful
				release();
				if(result && result.rows) {
					res.send('updated todo');
				}
			});
		});
	});

	// DELETE todo by id
	app.delete('/api/todos/:id', (req, res) => {
		pool.connect((err, client, release) => {
			if (err) {
				throw err;
			}

			querystring = `DELETE FROM todos WHERE id = '${req.params.id}'`;
			client.query(querystring, (err) => {
				if (err) {
					throw err;
				}

				// was successful
				release();
				res.send('deleted todo');
			});
		});
	});
}
