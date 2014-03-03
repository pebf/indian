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

	return {
		init : init
		, sendMsg : sendMsg
		, sendGameReady : sendGameReady
	}
}());