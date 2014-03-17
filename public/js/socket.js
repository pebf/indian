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
		oSocket.on('game_bet', processGameBet);
		oSocket.on('game_opponent_bet', processGameOpponentBet);
		oSocket.on('game_bet_gold_ok', processGameBetGoldOk);
		oSocket.on('game_stand_ok', processGameStandOk);
		oSocket.on('game_end', processGameEnd);
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
			, sRoomId : Ui.getData('room')['sRoomId']
		});
	}

	function processGameOpponentBet() {
		Ui.showGameLog('game_opponent_bet');
	}

	function processGameBet(htData) {
		Ui.processGameBet(htData.bIsFirstBet);
	}

	function sendGameBetGold(nGold) {
		oSocket.emit('game_bet_gold', {
			sUserName : Ui.getData('username')
			, sRoomId : Ui.getData('room')['sRoomId']
			, nBetGold : nGold
		});
	}

	function sendGameStand() {
		oSocket.emit('game_stand', {
			sUserName : Ui.getData('username')
			, sRoomId : Ui.getData('room')['sRoomId']
		});
	}

	function sendGameGiveUp() {
		oSocket.emit('game_give_up', {
			sRoomId : Ui.getData('room')['sRoomId']
		});
	}

	function processGameBetGoldOk(htData) {
		Ui.processGameBetGoldOk(htData);
	}

	function processGameStandOk(htData) {
		Ui.processGameStandOk(htData);
	}

	function processGameEnd(htData) {		
		console.log(htData.htResult);
	}

	return {
		init : init
		, sendMsg : sendMsg
		, sendGameReady : sendGameReady		
		, sendGameBetGold : sendGameBetGold
		, sendGameStand : sendGameStand
		, sendGameGiveUp : sendGameGiveUp
	}
}());