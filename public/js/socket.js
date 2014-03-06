indian.che.socket =(function() {
	var Ui
		, oSocket;

	function init() {
		Ui = indian.che.ui;
		initSocketIO();
	}

	function initSocketIO() {
		oSocket = io.connect('/room');

		oSocket.on('connect', sendJoin);
		oSocket.on('joined', processJoined);
		oSocket.on('msg', processMsg);

		oSocket.on('game_ready_ok', processGameReadyOk);
		oSocket.on('game_start', sendGameStart);
		oSocket.on('game_init', processGameInit);
	}

	function sendJoin() {
		oSocket.emit('join', {
			sRoomId : Ui.getData('room')['sRoomId']
			, sUserName : Ui.getData('username')
		});
	}

	function processJoined(htData) {
		if (htData.isSuccess) {
			Ui.showGameLog('joined', { sUserName : htData.sUserName});
			
			if (htData.htRoom) {
				Ui.showOpponentInfo(htData.htRoom.aMember);
			}
		}
	}

	function sendMsg(sMsg) {
		oSocket.emit('msg', {
			sUserName : Ui.getData('username')
			, sRoomId : Ui.getData('room')['sRoomId']
			, sMsg : sMsg			
		});
	}

	function processMsg(htData) {
		Ui.showMsg(htData);
	}

	function sendGameReady() {
		oSocket.emit('game_ready', {
			sRoomId : Ui.getData('room')['sRoomId']
			, sUserName : Ui.getData('username')
		});
	}

	function processGameReadyOk(htData) {
		Ui.processGameReady(htData.sUserName);		
	}

	function sendGameStart() {
		Ui.processGameStart();

		oSocket.emit('game_start', {
			sUserName : Ui.getData('username')
			, sRoomId : Ui.getData('room')['sRoomId']
		});
	}

	function processGameInit(htData) {
		Ui.processGameInit(htData);

		oSocket.emit('game_init_ok', {
			sUserName : Ui.getData('username')
		});
	}

	return {
		init : init
		, sendMsg : sendMsg
		, sendGameReady : sendGameReady
	}
}());