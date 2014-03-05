var Master = module.exports = {
	n_START_GOLD : 30
	, aUsers : []
	, aRooms : []	
	, nRoomIndexCnt : 0
	, hasUser : function(sName) {
		var aUsers = this.aUsers.filter(function(htUser) {
			return (htUser.sName === sName);
		});

		if (aUsers.length > 0) {
			return true;

		} else {
			return false;
		}
	}
	, createUser : function (sName) {
		return {
			sName : sName
			, nGold : this.n_START_GOLD
		}
	}
	
	, addUser : function (htUser) {
		if (!this.checkValidUser(htUser)) {
			// TODO : add exception 
			return;
		}

		this.aUsers.push(htUser);
	}

	, getUserByName : function (sName) {
		var aUsers = this.aUsers.filter(function(htUser) {
			return (htUser.sName === sName);
		});
		
		return aUsers[0];
	}

	, checkValidUser : function (htUser) {
		var bIsValid = true
			, htSampleUser = this.createUser();

		for (key in htSampleUser) {
			if (typeof htUser[key] === 'undefined') {
				bIsValid = false;
				continue;
			}
		}

		return bIsValid;	
	}

	, createRoom : function(sRoomName) {
		this.nRoomIndexCnt += 1;

		return { sRoomId : this.nRoomIndexCnt + ''
			, sRoomName : sRoomName
			, aMember : []
			, nReadyUser : 0}		
	}

	, hasRoom : function (sRoomName) {
		var aFilteredRooms = this.aRooms.filter(function (htRoom) {
			return (htRoom.sRoomName === sRoomName)
		});

		if (aFilteredRooms.length > 0) {
			return true;

		} else {
			return false;
		}
	}

	, addRoom : function (htRoom) {
		//TODO : htRoom validation
		this.aRooms.push(htRoom);
	}

	, getRoomList : function () {
		return this.aRooms;
	}

	, getRoomById : function (sRoomId) {
		var aRooms = this.aRooms.filter(function(htRoom) {
			return (htRoom.sRoomId === sRoomId);
		});
		
		return aRooms[0];
	}

	, joinRoom : function (sRoomId, htUser) {
		var htRoom = this.getRoomById(sRoomId);

		if (!this.isMemberInRoom(htRoom.aMember, htUser)) {
			htRoom.aMember.push(htUser);
		}
	}

	, isMemberInRoom : function (aMember, htUser) {
		return aMember.some(function (elem) {
			return elem.sName === htUser.sName;
		});
	}

	, getMemberList : function (sRoomId) {
		var htRoom = this.getRoomById(sRoomId);
		return htRoom.aMember;
	}

	, gameSetting : function (htRoom) {		
		this.setGame(htRoom);
		this.setUserForGame(htRoom);
		this.dealoutCard(htRoom);
	}

	, setGame : function (htRoom) {
		htRoom.htGame = this.createGame();
	}

	, createGame : function () {
		return {
			aDeck : this.getNewDeck()
			, aShareCards : []
			, sUserHasTurn : ''
			, aCardInHands : []
			, nBetMoney : 0
		}
	}

	, getNewDeck : function () {
		var aDeck = this.createDeck();
		return this.shuffleDeck(aDeck);
	}

	, createDeck : function () {
		var aDeck = [];

		for(var i = 1; i < 11; i++) {
			for(var j = 0; j < 4; j++) {
				aDeck.push(i);
			}
		}

		return aDeck;
	}

	, shuffleDeck : function (aDeck, nCount) {
		var nShuffleCount = nShuffleCount || 200
			, nCardNum = aDeck.length
			, nRan1, nRan2, nTemp;

		for (var i = 0; i < nShuffleCount; i++) {
			nRan1 =  Math.floor(Math.random() * nCardNum);
			nRan2 =  Math.floor(Math.random() * nCardNum);

			nTemp = aDeck[nRan1];
			aDeck[nRan1] = aDeck[nRan2];
			aDeck[nRan2] = nTemp;
		}

		return aDeck;
	}

	, setUserForGame : function (htRoom) {
		var aNames = this.getUserNameFromMember(htRoom)
			, htGame = htRoom.htGame;

		htGame.sUserHasTurn = aNames[0];

		for (var i = 0, nLength = aNames.length; i < nLength; i++) {
			htGame.aCardInHands.push({sName : aNames[i]
										, nCard : 0});
		}
	}

	, getUserNameFromMember : function (htRoom) {
		var aUserNames = []
			, aMember = htRoom.aMember;

		for (var i = 0, nLength = aMember.length; i < nLength; i++) {			
			aUserNames.push(aMember[i].sName);
		}

		return aUserNames;
	}

	, dealoutCard : function (htRoom) {
		var htGame = htRoom.htGame
			, aDeck = htGame.aDeck
			, aShareCards = htGame.aShareCards;

		aShareCards.push(aDeck.pop(), aDeck.pop());
		htGame.aCardInHands[0].nCard = aDeck.pop();
		htGame.aCardInHands[1].nCard = aDeck.pop();
	}

	, getOpponentCard : function (htGame, sUserName) {
		var aCardInHands = htGame.aCardInHands
			, htCardInfo;

		for (var i = 0, nLength = aCardInHands.length; i < nLength; i++) {
			htCardInfo = aCardInHands[i];

			if (htCardInfo.sName !== sUserName) {
				return htCardInfo.nCard;
			}
		}
	}
}