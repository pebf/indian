var Master = require('./master');

module.exports = function(app) {
	var io = require('socket.io').listen(app);

	io.configure(function() {
		io.set('log level', 2);
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
		socket.on('game_start', processGameInit.bind(this, socket));
		socket.on('game_init_ok', processGameBet.bind(this, socket));
		socket.on('game_bet_gold', processGameBetGold.bind(this, socket));
		socket.on('game_stand', processGameStand.bind(this, socket));
		socket.on('game_give_up', processGameGiveUp.bind(this, socket));
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
		var sRoomId = htData.sRoomId
			, htRoom = Master.getRoomById(sRoomId);

		htRoom.nReadyUser += 1;		

		socket.emit('game_ready_ok', htData);
		socket.broadcast.to(sRoomId).emit('game_ready_ok', htData);

		if (htRoom.nReadyUser > 1) {
			htRoom.nReadyUser = 0;
			Master.gameSetting(htRoom);

			socket.emit('game_start', htData);
			socket.broadcast.to(sRoomId).emit('game_start', htData);
		}
	}

	function processGameInit(socket, htData) {
		var htGame = Master.getRoomById(htData.sRoomId).htGame
			, nOpponentCard = Master.getOpponentCard(htGame, htData.sUserName);

		socket.emit('game_init', {
			aShareCards : htGame.aShareCards
			, nOpponentCard : nOpponentCard
		});
	}

	function processGameBet(socket, htData) {
		var htRoom = Master.getRoomById(htData.sRoomId)
			, htGame = htRoom.htGame;

		if (htGame.sUserInTurn !== htData.sUserName) {
			socket.emit('game_opponent_bet');
			return;
		}

		socket.emit('game_bet', {
			bIsFirstBet : (htGame.nTurn === 1)
		});
	}

	function processGameBetGold(socket, htData) {
		var htRoom = Master.getRoomById(htData.sRoomId)
			, htGame = htRoom.htGame
			, htUserInTurn = Master.getUserByName(htGame.sUserInTurn)
			, nBetGold = htData.nBetGold
			, nPrevBetGold = htGame.nPrevBetGold;
			
		htGame.nBetGold += nBetGold;
		htUserInTurn.nGold -= (nBetGold + nPrevBetGold);


		socket.emit('game_bet_gold_ok', {
			htUser : htUserInTurn
			, nBetGold : nBetGold
			, nPrevBetGold : nPrevBetGold
		});

		socket.broadcast.to(htRoom.sRoomId).emit('game_bet_gold_ok', {
			htUser : htUserInTurn
			, nBetGold : nBetGold
			, nPrevBetGold : nPrevBetGold
		});

		htGame.nPrevBetGold = nBetGold;
		processGameSwitchTurn(socket, htRoom);
	}

	function processGameSwitchTurn(socket, htRoom) {
		Master.switchTurn(htRoom);

		socket.emit('game_opponent_bet');
		socket.broadcast.to(htRoom.sRoomId).emit('game_bet', {});
	}

	function processGameStand(socket, htData) {
		var htRoom = Master.getRoomById(htData.sRoomId)
			, htGame = htRoom.htGame
			, htUserInTurn = Master.getUserByName(htGame.sUserInTurn);

		htGame.nBetGold += htGame.nPrevBetGold;
		htUserInTurn.nGold -= htGame.nPrevBetGold;

		socket.emit('game_stand_ok', {
			htUser : htUserInTurn			
			, nUserGold : htUserInTurn.nBetGold
			, nBetGold : htGame.nPrevBetGold
			, nTotalBetGold : htGame.nBetGold
		});

		socket.broadcast.to(htRoom.sRoomId).emit('game_opponent_stand_ok', {
			nUserGold : htUserInTurn.nBetGold
			, nBetGold : htGame.nPrevBetGold
			, nTotalBetGold : htGame.nBetGold
		});

		processGameJudge(socket, htRoom);
	}

	function processGameGiveUp(socket, htData) {

	}

	function processGameJudge(socket, htRoom) {
		var htResult = Master.getGameResult(htRoom)
			, sRoomId = htRoom.sRoomId
			, htWinner = Master.getUserByName(htResult.sName);

		Master.gameEnd(htRoom, htResult);
		
		socket.emit('game_end', {
			htResult : htResult
			, htWinner : htWinner
			, htGame : htRoom.htGame
		});

		socket.broadcast.to(htRoom.sRoomId).emit('game_end', {
			htResult : htResult
			, htWinner : htWinner
			, htGame : htRoom.htGame
		});
	}

	function processGameGiveUp(socket, htRoom) {

	}
}