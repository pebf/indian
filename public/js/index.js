indian = {};

indian.che = (function() {
	var aDeck = []		
		, aShareCards = []
		, isUserTurn = true
		, aUserResult = []
		, aOpponentResult = []
		, htBoard = {}
		, user
		, opponent
		, oUi;

	function initialize() {
		/* import */
		oUi = indian.che.ui;
		//UI
		oUi.initialize();

		gameInit();

		makeDeck();
		shuffleDeck();

		dealoutCard();
		
		oUi.showShareCards(aShareCards);
		oUi.showOpponentCard(user.card, opponent.card);

		//oUi.showChooseLayer();

		//calcurateResult();
		//console.log(judgeWhoIsWin());
	}

	function gameInit() {		
		playerInit();
	}

	function playerInit() {
		user = makePlayer();
		opponent = makePlayer();
	}

	function boardInit() {
		user.ganet -= 1;
		htBoard.userBet = 1;

		opponent.ganet -= 1;
		htBoard.opponentBet = 1;

		htBoard.turn = 'user';
	}

	function makePlayer() {
		return {
			ganet : 100
			, card : null
			, aLastCards : []
		}
	}

	function makeDeck() {
		for(var i = 1; i < 11; i++) {
			for(var j = 0; j < 4; j++) {
				aDeck.push(i);
			}
		}
	}

	function shuffleDeck(nCount) {
		var nCount = nCount || 200
			, nRandom1, nRandom2, nTemp;

		for(var i = 0; i < nCount; i++) {
			nRandom1 =  Math.floor(Math.random() * 40);
			nRandom2 =  Math.floor(Math.random() * 40);

			nTemp = aDeck[nRandom1];
			aDeck[nRandom1] = aDeck[nRandom2];
			aDeck[nRandom2] = nTemp; 
		}
	}

	function dealoutCard() {
		aShareCards.push(aDeck.pop());
		aShareCards.push(aDeck.pop());

		user.card = aDeck.pop();
		opponent.card = aDeck.pop();

		//test
		//opponent.card = aShareCards[0];
	}

	/* 승패 판단 로직 */
	function calcurateResult() {
		sortPlayersLastCards();
		getPlayersHaveSameCard(aUserResult, aOpponentResult);
		getPlayersHaveStraight(aUserResult, aOpponentResult);
	}

	function sortPlayersLastCards() {
		user.aLastCards = createSortedCards(user.card);
		opponent.aLastCards = createSortedCards(opponent.card);
	}

	function createSortedCards(nCard) {
		var aTempCards = aShareCards.slice()
			, nTempNum;

		aTempCards.push(nCard);
		
		for(var i = 0; i < aTempCards.length; i++) {
			for(var j = i + 1; j < aTempCards.length; j++ ) {
				if (aTempCards[i] > aTempCards[j]) {
					nTempNum = aTempCards[i];
					aTempCards[i] = aTempCards[j];
					aTempCards[j] = nTempNum;
				}
			}
		}
		
		return aTempCards;
	}

	function getPlayersHaveSameCard(aUserResult, aOpponentResult) {		
		hasSameCardInCards(user.aLastCards, aUserResult);
		hasSameCardInCards(opponent.aLastCards, aOpponentResult);
	}

	function hasSameCardInCards(aCardList, aResult) {
		var nNumOfCard = aCardList.length			
			, nNumOfSameCard = 1
			, aResult = aResult || []
			, sTargetCard;

		for (var i = 0; i < nNumOfCard; i++) {
			if (nNumOfSameCard === 1) {
				sTargetCard = aCardList[i];
			}

			if (sTargetCard === aCardList[i + 1]) {
				nNumOfSameCard += 1;

			} else {
				if (nNumOfSameCard === 4) {
					aResult.push({type : 'poker', num : sTargetCard});

				} else if (nNumOfSameCard === 3) {
					aResult.push({type : 'triple', num : sTargetCard});
				
				} else if (nNumOfSameCard === 2) {
					aResult.push({type : 'pair', num : sTargetCard});
				}

				nNumOfSameCard = 1;
			}			
		}		
	}
    
	function getPlayersHaveStraight(aUserResult, aOpponentResult) {
		hasStraightInCards(user.aLastCards, aUserResult);
		hasStraightInCards(opponent.aLastCards, aOpponentResult);
	}

	function hasStraightInCards(aCardList, aResult) {
		var nStraightNum = 3
			, nNumOfCard = aCardList.length
			, aStraightList = [];

		for (var i = 0; i < nNumOfCard; i++) {
			if ((aCardList[i] + 1) % 10 === aCardList[i + 1] % 10
				&& (aCardList[i + 1] + 1) % 10 === aCardList[i + 2] % 10) {
				aResult.push({type : 'straight', aNum : [aCardList[i], aCardList[i + 1], aCardList[i + 2]]});
			}
		}
	}

	function judgeWhoIsWin() {
		var result = getInfoAboutResult('triple');

		if (result) {
			return result;
		}

		result = getInfoAboutResult('straight');

		if (result) {
			return result;
		}

		result = getInfoAboutResult('pair');

		if (result) {
			return result;
		}

		if (user.card > opponent.card) {
			return {winner : 'user', num : user.card};

		} else if (user.card < opponent.card) {
			return {winner : 'opponent', num : opponent.card};

		} else {
			return {sType : 'draw'};
		}
	}

	function getInfoAboutResult(sType) {
		var htUserResult = getInfoFromResult(sType, aUserResult)
			, htOpponentResult = getInfoFromResult(sType, aOpponentResult)
			, nUserDecisionNum
			, nOpponentDecisionNum;

		if (!htUserResult && !htOpponentResult) {
			return null;
		}

		if (!htUserResult) {			
			return {winner : 'opponent', type : sType, num : htOpponentResult.num};
		}

		if (!htOpponentResult) {
			return {winner : 'user', type : sType,  num : htUserResult.num};
		}

		if (sType === 'straight') {
			nUserDecisionNum = user.aLastCards[2];
			nOpponentDecisionNum = opponent.aLastCards[2];

		} else {
			nUserDecisionNum = htUserResult.num;
			nOpponentDecisionNum = htOpponentResult.num;
		}

		if (nUserDecisionNum > nOpponentDecisionNum) {
			return {winner : 'user', type : sType,  num : nUserDecisionNum}

		} else if (nUserDecisionNum < nOpponentDecisionNum) {
			return {winner : 'opponent', type : sType, num : nOpponentDecisionNum}

		} else {
			return {winner : 'draw'};
		}

		return null;
	}

	function getInfoFromResult(sType, aResult) {
		var nLength =  aResult.length
			, htResult;

		for (var i = 0; i < nLength; i++) {
			htResult = aResult[i];

			if (htResult.type === sType) {
				return htResult;
			}
		}

		return null;
	}
	
	return {
		initialize : initialize
	}
})();