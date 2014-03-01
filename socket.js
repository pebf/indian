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
	}

	function processJoin(socket, htData) {
		if (!Master.getRoomById(htData.sRoomId)) {
			socket.emit('joined', {
				isSuccess : false
			});
			return;
		}

		sJoinedRoomId = htData.sRoomId;
		socket.join(sJoinedRoomId);
		socket.emit('joined', {
			isSuccess : true
			, sUserName : htData.sUserName
		});

		socket.broadcast.to(sJoinedRoomId).emit('joined', {
			isSuccess : true
			, sUserName : htData.sUserName
		});
	}

	function processMsg(socket, htData) {
		socket.broadcast.to(htData.sRoomId).emit('msg', htData);
	}
}