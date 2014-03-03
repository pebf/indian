var Master = require('./master');

module.exports = function(app) {
	var io = require('socket.io').listen(app);

	io.configure(function() {
		io.set('log level', 3);
		io.set('transports', [
			'websocket'
			, 'flashsocket'
			, 'htmlfile'
			, 'xhr-polling'
			, 'jsonp-polling'
		]);
	});

	var Room = io.of('/room')
				.on('connection', socketInit);

	function socketInit(socket) {
		var sJoinedRoom = null;
		socket.on('join', processJoin.bind(this, socket));
		socket.on('msg', processMsg.bind(this, socket));

		socket.on('game_ready', processGameReady.bind(this, socket));
	}

	function processJoin(socket, htData) {
		var sJoinedRoomId = htData.sRoomId
			, htUser = Master.getUserByName(htData.sUserName)
			, htRoom = Master.getRoomById(sJoinedRoomId);

		if (!Master.getRoomById(htData.sRoomId)) {
			socket.emit('joined', {
				isSuccess : false
			});
			return;
		}

		Master.joinRoom(sJoinedRoomId, htUser);
		
		socket.join(sJoinedRoomId);
		socket.emit('joined', {
			isSuccess : true
			, sUserName : htData.sUserName
			, htRoom : htRoom
		});

		socket.broadcast.to(sJoinedRoomId).emit('joined', {
			isSuccess : true
			, sUserName : htData.sUserName
			, htRoom : htRoom
		});		
	}

	function processMsg(socket, htData) {
		// TODO : 메소드를 한 번만 사용할 수 없을까?
		socket.emit('msg', htData);
		socket.broadcast.to(htData.sRoomId).emit('msg', htData);
	}

	function processGameReady(socket, htData) {
		socket.emit('game_ready_ok', htData);
		socket.broadcast.to(htData.sRoomId).emit('game_ready_ok', htData);
	}
}