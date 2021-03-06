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

	, getAnotherUserInRoom : function (htRoom, sName) {
		var aMember = htRoom.aMember
			, htUser = aMember[0];

		if (htUser.sName !== sName) {
			return htUser;
		} else {
			return aMember[1];
		}		
	}

	, getAvailableRoom : function () {
		var aRooms = this.aRooms
			, aAvailableRooms = []
			, htRoom
			, nRandom;

		for (var i = 0; i < aRooms.length; i++)	{
			htRoom = aRooms[i];
			if (htRoom.aMember.length < 2) {
				aAvailableRooms.push(htRoom);
			}
		}

		nRandom = Math.floor(Math.random() * aAvailableRooms.length);
		return aAvailableRooms[nRandom];
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

	, joinRoom : function (htRoom, htUser) {
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
			, sUserInTurn : []
			, aCardInHands : []
			, nBetGold : 0
			, nPrevBetGold : 0
			, nTurn : 1
			, nDrawCnt : 0
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

		htGame.sUserInTurn = aNames[0];

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

	, switchTurn : function (htRoom) {
		var htGame = htRoom.htGame
			, aNames = this.getUserNameFromMember(htRoom);

		htGame.nTurn += 1;
		this.switchUserInTurn(htRoom);
	}

	, switchUserInTurn : function (htRoom) {
		var htGame = htRoom.htGame
			, aNames = this.getUserNameFromMember(htRoom);

		htGame.sUserInTurn = aNames.filter(function (sUserName) {
			return (sUserName !== htGame.sUserInTurn);
		})[0];
	}

	, getGameResult : function (htRoom) {
		var htGame = htRoom.htGame
			, aUserLastCards = this.makeUserLastCard(htGame)
			, aResultSet = this.calcurateCard(aUserLastCards)
			, htWinnerInfo;

		htWinnerInfo = this.judgeBy('triple', aResultSet) ||
						this.judgeBy('straight', aResultSet) ||
						this.judgeBy('pair', aResultSet) ||
						this.judgeBy('larger_num', aResultSet);

		return htWinnerInfo;
	}

	, makeUserLastCard : function (htGame) {		
		var aUserLastCards = this.getUserLastCards(htGame);
		this.sortCards(aUserLastCards);

		return aUserLastCards;
	}

	, getUserLastCards : function (htGame) {
		var aCardInHands = htGame.aCardInHands
			, aShareCards = htGame.aShareCards
			, aUserLastCards = []
			, htCardInHands;

		for (var i = 0, nLength = aCardInHands.length; i < nLength; i++) {
			htCardInHands = aCardInHands[i];

			aUserLastCards.push({
				sName : htCardInHands.sName
				, aCards : [aShareCards[0], aShareCards[1], htCardInHands.nCard]
			})
		}

		return aUserLastCards;
	}

	, sortCards : function (aUserCards) {
		for (var i = 0, nLength = aUserCards.length; i < nLength; i++) {
			aCards = aUserCards[i].aCards;

			for (var j = 0, nCardsLength =  aCards.length; j < nCardsLength; j++) {
				for (var k = j + 1; k < nCardsLength; k++) {
					if (aCards[j] > aCards[k]) {
						nTemp = aCards[j];
						aCards[j] = aCards[k];
						aCards[k] = nTemp;
					}
				}
			}
		}
	}

	, calcurateCard : function(aUserLastCards) {
		var aResultSet = []
			, that = this;

		aUserLastCards.forEach(function(htLastCards) {
			var htResult = { sName : htLastCards.sName }
				, htSameCardResult
				, htTempResult;
			
			htTempResult = that.checkHasSameCard(htLastCards);

			if (!htTempResult) {
				htTempResult = that.checkHasStaright(htLastCards);	
			}			


			if (htTempResult) {
				htResult.sType = htTempResult.sType;
				htResult.nCard = htTempResult.nCard;
			}

			if (!htTempResult) {
				htResult.sType = 'larger_num'
				htResult.nCard = htLastCards.aCards[2];
			}

			aResultSet.push(htResult);
		});

		return aResultSet;
	}

	, checkHasSameCard : function(htLastCards) {
		var aCards = htLastCards.aCards
			, nCardNum = aCards.length
			, nSameCardNum = 1;

		for (var i = 0; i < nCardNum - 1; i++) {
			if (aCards[i] === aCards[i + 1]) {
				nSameCardNum += 1;

			} else {
				if (nSameCardNum === 3) {
					return {sType : 'triple', nCard : aCards[i]};

				} else if (nSameCardNum === 2) {
					return {sType : 'pair', nCard : aCards[i]};
				}

				nSameCardNum = 1;
			}
		}
	}

	, checkHasStaright : function(htLastCards) {
		var nStraightNum = 3
			, aCards = htLastCards.aCards;

		if (aCards[0] + 1 % 10 === aCards[1] % 10
			&& aCards[1] + 1 % 10 === aCards[2] % 10) {
			return {sType : 'straight'
					, nCard : Math.max(aCards[0], aCards[1], aCards[2])};
		}
	}

	, judgeBy : function(sType, aResultSet) {
		var htResult1 = aResultSet[0]
			, htResult2 = aResultSet[1]
			, bUser1HasType = htResult1.sType === sType
			, bUser2HasType = htResult2.sType === sType
			, nCard1, nCard2;

		if (bUser1HasType && !bUser2HasType) {
			return  htResult1;

		} else if (!bUser1HasType && bUser2HasType) {
			return  htResult2;

		} else if (bUser1HasType && bUser2HasType) {
			if (htResult1.nCard > htResult2.nCard ) {
				return htResult1;

			} else if (htResult1.nCard < htResult2.nCard ) {
				return htResult2;

			} else {
				return {sType : 'draw'};
			}
		}

		return null;
	}

	// {
	// 		aDeck : this.getNewDeck()
	// 		, aShareCards : []
	// 		, sUserInTurn : []
	// 		, aCardInHands : []
	// 		, nBetGold : 0
	// 		, nPrevBetGold : 0
	// 		, nTurn : 1
	// 		, nDrawCnt : 0
	// 	}

	, gameEnd : function(htRoom, htResult) {
		var htGame = htRoom.htGame
			, nBetGold = htGame.nBetGold
			, sWinnerName = htResult.sName
			, htWinner;

		if (sWinnerName) {
			htWinner = this.getUserByName(sWinnerName);
			htWinner.nGold += nBetGold;
			htGame.nDrawCnt = 0;

			if (sWinnerName !== htGame.sUserInTurn)  {
				this.switchUserInTurn(htRoom);
			}

		} else {
			htGame.nDrawCnt +=1;
		}

		this.gameInit(htGame);
	}

	, gameGiveUp : function(htRoom, sLoserName) {
		var htGame = htRoom.htGame
			, nBetGold = htGame.nBetGold
			, htWinner = this.getAnotherUserInRoom(htRoom, sLoserName);

		htWinner.nGold += nBetGold;
		this.gameInit(htGame);

		return {
			sName : htWinner.sName
			, sType : 'give_up'
		}
			
	}

	, gameInit : function(htGame) {
		htGame.aShareCards = [];
		htGame.aCardInHands = [];
		htGame.nBetGold = 0;
		htGame.nPrevBetGold = 0;
		htGame,nTurn = 1;		
	}
}