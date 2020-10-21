var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    //pg = require('pg'),
    app = express();
 
// DB Connect String
const connect = "postgress://Admin:akatensai68@localhost:5432/recipebookdb";
const {Pool, Client} = require('pg');
const client = new Client({
    connectionString: connect
})
client.connect();
 
// Assign Dust Engine To .dust Files
app.engine('dust', cons.dust);
 
// Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
 
// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));
 
// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
 
app.get('/', function(req, res){
//    res.render('index');
client.query('SELECT * FROM recipes', function(err, result){
	if(err) {
		return console.error('error running query', err);
	}
	//console.log(result.rows);
	res.render('index', {recipes:result.rows});
	})
});

app.post('/add',function(req, res){
   // client.query("SELECT setval('recipes_id_seq', COALESCE((SELECT MAX(id)+1 FROM recipes), 1), false)");
    client.query('INSERT INTO recipes(id, name, ingredients, directions) VALUES((SELECT MAX(id)+1 FROM recipes), $1, $2, $3)',
        [req.body.name, req.body.ingredients, req.body.directions]);
		res.redirect('/');
})

app.delete('/delete/:id', function(req, res){
	client.query('DELETE FROM recipes WHERE id = $1',
		[req.params.id]);
})

app.post('/edit', function(req, res) {
    client.query('UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4',
        [req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
        res.redirect('/');
})

// Server
app.listen(3000, function(){
    console.log('Server Started On Port 3000');
});