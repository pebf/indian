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
			oSocket.emit('join', { 
				sRoomName : Ui.getData('roomname')
			});
		});

		oSocket.on('joined', function(htData) {
			if (htData.isSuccess) {
				Ui.showGameLog('joined');
			}
		})
	}

	return {
		init : init
	}
}());