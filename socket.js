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
				.on('connection', function(socket) {
					var sJoinedRoom = null;
					socket.on('join', function(htData) {
						if (!Master.hasRoom(htData.sRoomName)) {
							socket.emit('joined', {
								isSuccess : false
							});
							
							return;
						}

						sJoinedRoom = htData.sRoomName;
						socket.join(sJoinedRoom);
						socket.emit('joined', {
							isSuccess : true
							, sUserName : htData.sUserName
						});

						socket.broadcast.to(sJoinedRoom).emit('joined', {
							isSuccess : true
							, sUserName : htData.sUserName
						});
					});
				});
}