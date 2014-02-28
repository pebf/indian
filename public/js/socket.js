indian.che.socket =(function() {
	var Ui
		, oSocket;


	function init() {
		Ui = indian.che.ui;
		initSocketIO();
	}

	function initSocketIO() {		
		oSocket = io.connect('/room');

		oSocket.on('connect', function() {
			console.log('socket : connect');
			console.log('roomname : ' + Ui.getData('roomname'));
			oSocket.emit('join', { 
				sRoomName : Ui.getData('roomname')
			});
		});

		oSocket.on('joined', function(htData) {
			console.log('socket : joined');
			console.log('isSuccess : ' + htData.isSuccess);
			if (htData.isSuccess) {
				Ui.showGameLog('joined');
			}
		})
	}

	return {
		init : init
	}
}());