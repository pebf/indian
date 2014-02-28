
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path')
	, Master = require('./master')
	//, Chat = require('./chat');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret : 'secret key'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
	res.render('login');
});

app.get('/users', user.list);

app.post('/waitingRoom', function(req, res) {
	var sName = req.body.name;

	if (!sName || sName.trim() === '') {
		res.render('login', {
			sErrorMsg : 'input your name.'
		});
	}

	if (Master.hasUser(sName)) {
		res.render('login', {
			sErrorMsg : 'nickname is already exists.'
		});
	}

	var htUser = Master.createUser(sName);

	Master.addUser(htUser);
	req.session.name = sName;

	//debug
	console.log(Master.getRoomList());

	res.render('waitingroom', {
		user : htUser
		, aRoomList : Master.getRoomList()
	});
});

app.post('/makeRoom', function(req, res) {
	var sRoomName = req.body.roomName;

	// TODO : if sRoomName is blank, its process have to doing by ajax call
	// TODO : if sRoomName is 'dupicated, its process have to doing by ajax call
	Master.addRoom(sRoomName);

	
	res.render('index', {
		roomName : sRoomName
		, user : Master.getUserByName(req.session.name)
	});
});

app.get('/join/:id', function(req, res) {
	var sRoomName = req.params.id;

	if (Master.hasRoom(sRoomName)) {
		return;
	}

	res.render('', {
		sRoomName : sRoomName
		, sName : req.session.sName
	});
});

var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
require('./socket')(server);
