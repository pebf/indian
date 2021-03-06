
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path')
	, Master = require('./master');	

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

// Exception Handler - js 에러 시 서버가 죽는 현상 방지 
process.on('uncaughtException', function(err) {
	// TODO : err.stack 사용 필요
	// http://nodeqa.com/nodejs_ref/5 참조
	console.log('Caught Exception : ' + err); 
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

(function action() {
	app.get('/', function(req, res){
		res.render('login');
	});

	app.get('/users', user.list);

	app.post('/waitingRoom', function(req, res) {
		var sName = req.body.name;

		if (!sName || sName.trim() === '') {
			res.render('login', {
				sErrorMsg : 'Input your name'
			});
			return;
		}

		if (Master.hasUser(sName)) {
			res.render('login', {
				sErrorMsg : 'Nickname is already exists'
			});
			return;
		}

		var htUser = Master.createUser(sName);

		Master.addUser(htUser);
		req.session.sName = sName;

		res.render('waitingroom', {
			user : htUser
			, aRoomList : Master.getRoomList()
		});
	});

	app.post('/randomMatch', function(req, res) {
		if (req.session.sName == 'undefiend') {
			res.render('login');
			return;
		}

		var htRoom = Master.getAvailableRoom()
			, htUser = Master.getUserByName(req.session.sName);;

		if (!htRoom) {
			// TODO : show error
			return;
		}

		res.render('index', {
			htRoom : htRoom
			, htUser : htUser
		});
	});

	app.post('/makeRoom', function(req, res) {
		if (req.session.sName == 'undefiend') {
			res.render('login');
			return;
		}

		var sRoomName = req.body.roomName
			, htRoom = Master.createRoom(sRoomName)
			, htUser = Master.getUserByName(req.session.sName);

		// TODO : if sRoomName is blank, its process have to doing by ajax call
		// TODO : if sRoomName is dupicated, its process have to doing by ajax call

		Master.addRoom(htRoom);
		
		res.render('index', {
			htRoom : htRoom
			, htUser : htUser
		});
	});

	app.get('/join/:roomId', function(req, res) {
		if (req.session.sName == 'undefiend') {
			res.render('login');
			return;
		}

		var sRoomId = req.params.roomId
			, htUser = Master.getUserByName(req.session.sName)
			, htRoom = Master.getRoomById(sRoomId);

		if (!htRoom) {
			return;
		}

		res.render('index', {
			htRoom : htRoom
			, htUser : htUser
		});
	});
}())


var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
require('./socket')(server);
