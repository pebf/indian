indian.che.ui = (function() {
	var Socket
		, htElement = {}		
		, htData = {}
		, nMoveTime = 1000;		

	function initialize () {
		Socket = indian.che.socket;

		resizeBrowser();
		initVar();
		assignHTML();
		attachEvent();
		Socket.init();
	}

	function resizeBrowser () {
		window.resizeTo(1024, 696);
	}

	function initVar() {
		htData['username'] = ghtInitData.htUser.sUserName;
		htData['usergold'] = ghtInitData.htUser.sUserGold;
		htData['room'] = ghtInitData.htRoom;
	}

	function getData(sKey) {
		return htData[sKey];
	}

	function setData(sKey, oValue) {
		if (typeof oValue !== 'undefined') {
			htData[sKey] = oValue;
		}
	}

	function assignHTML() {
		htElement['header'] = $('body > ._header');

		htElement['game'] = $('body > ._game');
		htElement['game_ct'] = htElement['game'].find('> ._game_ct');

		htElement['user_area'] = htElement['game_ct'].find('> ._user_area');
		htElement['user_hand'] = htElement['user_area'].find('> ._user_hand');		
		htElement['user_card_wrap'] = htElement['user_hand'].find('> ._card_wrap');
		htElement['user_info'] = htElement['user_area'].find('> ._player_info');
		htElement['opponent_area'] = htElement['game_ct'].find('> ._opponent_area');
		htElement['opponent_hand'] = htElement['opponent_area'].find('> ._opponent_hand');
		htElement['opponent_card_wrap'] = htElement['opponent_hand'].find('> ._card_wrap');
		htElement['opponent_info'] = htElement['opponent_area'].find('> ._player_info');

		htElement['middle_area'] = htElement['game'].find('> .game_ct > ._middle_area');
		htElement['board'] = htElement['middle_area'].find('> div._board');
		htElement['board_top'] = htElement['board'].find('> div._top_area');
		htElement['share_card_wrap'] = htElement['board_top'].find('div._card_wrap');

		htElement['board_btm'] = htElement['board'].find('> div._btm_area');
		htElement['deck_card_wrap'] = htElement['board_btm'].find('div._card_wrap');
		htElement['bet_gold'] = htElement['middle_area'].find('> div._bet_box > p._bet_gold');

		htElement['msg_area'] = $(document.body).find('> ._msg_area');
		htElement['game_log'] = htElement['msg_area'].find('._game_log_content');
		htElement['chat_box'] = htElement['msg_area'].find('._chat_content');

		htElement['bet_layer'] = $('body > div._bet_layer');
		htElement['bet_gold_layer'] = $('body > div._bet_gold_layer');
		htElement['result_layer'] = $('body > div._result_layer');
	}

	function attachEvent() {
		$(document.body).on('click', onClick);
	}

	function onClick(we) {
		var welTarget = $(we.target);		

		if (welTarget.hasClass('_send_msg')) {
			sendMsg.bind(this, welTarget)();
			we.preventDefault();

		} else if (welTarget.hasClass('_ready_btn')) {
			readyForGame(welTarget);
			we.preventDefault();

		} else if (welTarget.hasClass('_bet_btn')) {
			clickBetBtn(welTarget);
			we.preventDefault();

		} else if (welTarget.hasClass('_bet_gold_btn')) {
			clickBetGoldBtn(welTarget);
			we.preventDefault();

		} else if (welTarget.hasClass('_result_ok')) {
			initNewGame(welTarget);
			we.preventDefault();
		}
	}

	function sendMsg(welTarget) {
		var welInput = welTarget.parent().parent().find('input._input_msg');			
		procSendMsg(welInput);
	}

	function inputMsg(event, elTarget) {
		if (event.keyCode !== 13) { // 13 : enter keycode
			return;
		}
		
		procSendMsg($(elTarget));
	}

	function procSendMsg(welInput) {		
		var sMsg = welInput.val();

		if (!sMsg || $.trim(sMsg) === '') {
			return;
		}

		Socket.sendMsg(sMsg);
		welInput.val('');
	}

	function showMsg(sMsg) {
		var elMsg = '<p>' + sMsg + '</p>';
		htElement['msg_area'].append(elMsg);
	}

	function readyForGame(welTarget) {
		if (!welTarget.hasClass('user') || welTarget.hasClass('already')) {
			return;
		}

		Socket.sendGameReady();
	}

	function processGameReady(sUserName) {
		var welBtn = findReadyBtn(sUserName === getData('username'));

		welBtn.addClass('already')
			.removeClass('ready')
			.val('READY');

		showGameLog('game_ready', {sUserName : sUserName});
	}

	function processGameStart() {
		hideReadyBtn(findReadyBtn(true));
		hideReadyBtn(findReadyBtn());

		showGameLog('game_start');
	}

	function processGameInit(htData) {		
		moveCardTo(htElement['share_card_wrap'], showShareCards.bind(this, htData.aShareCards), true);
		showGameLog('game_show_share_cards', {aShareCards : htData.aShareCards});

		moveCardTo(htElement['opponent_card_wrap'], showOpponentCard.bind(this, htData.nOpponentCard));
		showGameLog('game_show_opponent_card', {nOpponentCard : htData.nOpponentCard});

		moveCardTo(htElement['user_card_wrap'], showUserCard);
	}

	function processGameBet(bIsFirstBet) {
		showBetLayer(bIsFirstBet);
		showGameLog('game_user_bet', {sUserName : getData('username')});
	}

	function processGameBetGoldOk(htData) {
		var bIsUser = htData.htUser.sName === getData('username');

		updateUserGold(htData.htUser.nGold, bIsUser);
		updateBetGold(htData.nBetGold + htData.nPrevBetGold);

		showGameLog(bIsUser ? 'game_user_bet_gold_ok' : 'game_opponent_bet_gold_ok'
					, {nBetGold : htData.nBetGold
						, nPrevBetGold : htData.nPrevBetGold});
	}

	function processGameStandOk(htData) {
		updateUserGold(htData.nUserGold, true);
		updateBetGold(htData.nBetGold);

		htElement['bet_layer'].hide();
		
		showGameLog('game_user_stand_ok', { nBetGold : htData.nBetGold});
	}
	
	function processGameOpponentStandOk(htData) {
		updateUserGold(htData.nUserGold);
		updateBetGold(htData.nTotalBetGold);
		showGameLog('game_opponent_stand_ok', { nBetGold : htData.nBetGold});
	}

	function processGameGiveUpOk(htData) {
		showGameLog('game_give_up_ok');
	}

	function processGameOpponentGiveUpOk(htData) {
		showGameLog('game_opponent_give_up_ok');
	}

	function processGameEnd(htData) {
		var htResult = htData.htResult
			, htWinner = htData.htWinner
			, sType = htResult.sType
			, bIsUser;

		if (sType === 'draw') {
			showGameLog('game_draw');

		} else {
			bIsUser = htWinner.sName === getData('username');
			updateUserGold(htWinner.nGold);
			showGameLog(bIsUser ? 'game_win' : 'game_lose'
						, { sType : sType }
			);
		}
		
		revealUserCard(htData.aCardInHands);

		htElement['result_layer']
			.find('> div._choose_text > p')
			.html(makeResultText(htResult, bIsUser));

		showLayer(htElement['result_layer']);
	}

	function showLayer(welLayer) {
		var nLeft = ($(document).width() - welLayer.width()) / 2;

		welLayer.css('left', nLeft)
			.show();
	}

	function hideLayer() {
		htElement['bet_layer'].hide();
		htElement['bet_gold_layer'].hide();
		htElement['result_layer'].hide();
	}

	function revealUserCard(aCardInHands) {
		var nCard;

		for(var i = 0, nLength = aCardInHands.length; i < nLength; i++) {
			htCardInHands = aCardInHands[i];

			if (htCardInHands.sName === getData('username')) {
				nCard = htCardInHands.nCard;
			}
		}

		showUserCard(nCard);
	}

	function updateUserGold(nGold, bIsUser) {
		var welInfo;

		if (bIsUser) {
			welInfo = htElement['user_info'];
			setData('usergold', nGold);
			
		} else {
			welInfo = htElement['opponent_info'];
		}

		if (nGold) {
			welInfo.find('span._gold').html(nGold);
		}
	}

	function updateBetGold(nBetGold) {
		htElement['bet_gold'].html(nBetGold);
	}

	function showReadyBtn() {
		findReadyBtn().show();
		findReadyBtn(true).show();
	}

	function hideReadyBtn(welBtn) {
		welBtn.hide()
			.addClass('ready')
			.removeClass('already')
			.val('GAME_START');
	}

	function findReadyBtn(bIsUser) {
		var welArea = (bIsUser) ? htElement['user_info'] : htElement['opponent_info']
		return welArea.find('._ready_btn');
	}

	function showOpponentInfo(aMember) {
		if (aMember.length < 2) {
			return;
		}

		var htOpponent = findOpponentInMember(aMember)
			, welPlayerBox = htElement['opponent_info'].find('> ._player_box')
			, welName = welPlayerBox.find('> ._player_box_header > ._player_name')
			, welGold = welPlayerBox.find('> ._player_box_body  ._gold');

		welName.html(htOpponent.sName);
		welGold.html(htOpponent.nGold);
	}

	function findOpponentInMember(aMember) {
		var htMember;

		for(var i = 0, nLength = aMember.length; i < nLength; i++) {
			htMember = aMember[i];
			if (htMember.sName !== getData('username')) {
				return htMember;
			}
		}

		return null;
	}

	function showShareCards(aShareCards) {
		var welCard1 = makeCardHTML(aShareCards[0])
			, welCard2 = makeCardHTML(aShareCards[1]);

		htElement['share_card_wrap'].html(welCard1)
								.append(welCard2);
	}

	function showOpponentCard(nOpponentCard) {
		var welOpponentCard = makeCardHTML(nOpponentCard);

		htElement['opponent_card_wrap'].html(welOpponentCard);
	}

	function showUserCard(nUserCard) {
		var welCard = (typeof nUserCard === 'undefined') ?
			makeCardHTML() : makeCardHTML(nUserCard);

		htElement['user_card_wrap'].html(welCard);
	}

	function makeCardHTML(nNum) {
		var aCardHTML = []
			, sBack = nNum ? '' : 'back'
			, sNum = nNum ? '<span>' + nNum + '</span>' : '';

		aCardHTML.push('<div class="card ' + sBack + '">');
		aCardHTML.push('<div class="card_inner">' + sNum  + '</div></div>');
		return $(aCardHTML.join(''));
	}

	function showGameLog(sCode, htOption) {
		var sMsg
			, welGameLog = htElement['game_log'];

		switch (sCode) {
			case 'game_start' :
				sMsg  = '게임을 시작합니다';
				break;
			case 'dealout_card' :
				sMsg = '카드를 배분합니다'
				break;
			case 'joined' :
				sMsg = '<strong>' + htOption.sUserName + '</strong> 님이 입장하셨습니다';
				break;
			case 'game_ready' :
				sMsg = '<strong>' + htOption.sUserName + '</strong> 님 준비';
				break;
			case 'game_show_share_cards' :
				sMsg = '공유카드는 ' + htOption.aShareCards[0] + ', ' + htOption.aShareCards[1] + '입니다';
				break;
			case 'game_show_opponent_card' :
				sMsg = '상대방 카드는 ' + htOption.nOpponentCard + '입니다';
				break;
			case 'game_opponent_bet' :
				sMsg = '상대방이 선택 중 입니다';
				break;
			case 'game_user_bet' :
				sMsg = '<strong>' + htOption.sUserName + '</strong> 님의 차례입니다';
				break;
			case 'game_user_bet_gold_ok' :
				sMsg = '<strong>' + htOption.nPrevBetGold + '</strong>골드에 추가로 <strong>' + htOption.nBetGold + '</strong> 골드를 배팅했습니다.';
				break;
			case 'game_opponent_bet_gold_ok' :
				sMsg = '상대방이 <strong>' + htOption.nPrevBetGold + '</strong>골드에 추가로<strong>' + htOption.nBetGold + '</strong> 골드를 배팅했습니다.';
				break;
			case 'game_user_stand_ok' :
				sMsg = '<strong>' + htOption.nBetGold + '</strong> 골드로 스탠드하였습니다.';
				break;
			case 'game_opponent_stand_ok' :
				sMsg = '상대방이 <strong>' + htOption.nBetGold + '</strong> 골드로 스탠드하였습니다.';
				break;
			case 'game_give_up_ok' :
				sMsg = '포기하였습니다.';
				break;
			case 'game_opponent_give_up_ok' :
				sMsg = '상대방이 포기하였습니다.';
				break;
			case 'game_win' :
				sMsg = '승리하였습니다.';
				break;
			case 'game_lose' :
				sMsg = '상대방이 승리하였습니다.';
				break;
			case 'game_draw' :
				sMsg = '무승부입니다.';
				break;
		}
		
		welGameLog.append('<p>' + sMsg + '</p>');
		welGameLog[0].scrollTop = welGameLog[0].scrollHeight;
	}

	function showMsg(htData) {
		var sMsg = '<p>' + htData.sUserName + ' : ' + htData.sMsg + '</p>'
			, elChatBox = htElement['chat_box'][0];
		
		htElement['chat_box'].append(sMsg);
		elChatBox.scrollTop = elChatBox.scrollHeight;
	}

	function showBetLayer(bIsFirstBet) {
		htElement['bet_gold_layer'].hide();

		var welBetLayer = htElement['bet_layer'];

		if (bIsFirstBet) {
			welBetLayer.find('> ._stand').hide();
			welBetLayer.find('> ._give_up').hide();
		}

		showLayer(welBetLayer);
	}

	function showBetGoldLayer() {
		htElement['bet_layer'].hide();
		showLayer(htElement['bet_gold_layer']);
	}

	function clickBetBtn(welTarget) {
		if (welTarget.hasClass('_bet')) {
			showBetGoldLayer();			

		} else if (welTarget.hasClass('_stand')) {
			Socket.sendGameStand();

		} else if (welTarget.hasClass('_give_up')) {
			Socket.sendGameGiveUp();
		}
	}

	function clickBetGoldBtn(welTarget) {
		if (welTarget.hasClass('_bet_gold')) {
			betGold(welTarget);			

		} else if (welTarget.hasClass('_cancel')) {
			showBetLayer();
		}
	}

	function betGold(welTarget) {
		var nGold = welTarget.prev().val() - 0
			, nUserGold = getData('usergold');

		if (!nGold) {
			alert('배팅할 금액을 정확히 입력해주세요');
			return;

		} else if (nGold > nUserGold) {
			alert('가지고 있는 골드를 초과하여 배팅할 수 없습니다');
			return;
		}

		Socket.sendGameBetGold(nGold);
		htElement['bet_gold_layer'].hide();
	}

	function makeResultText(htResult, bIsUser) {
		var sType = htResult.sType;

		if (sType === 'draw') {
			return '무승부입니다.';
		}		

		if (sType === 'give_up') {
			return (bIsUser ? '상대방이 ' : '') + '기권하였습니다.';
		}

		var sText = bIsUser ? '' : '상대방이 ';

		switch (sType) {
			case 'triple' :
			sText += '트리플로';
			break;

			case 'straight' :
			sText += '스트레이트로';
			break;

			case 'pair' :
			sText += '페어로';
			break;

			case 'larger_num' :
			sText += '큰 숫자로';
			break;
		}

		return sText + ' 승리하였습니다.';
	}

	function initNewGame() {
		hideLayer();
		updateBetGold(0);

		showReadyBtn();
		emptyCardWrap();
	}

	function moveCardTo(elTarget, fCallback, bIsShareCard) {
		var startOffset = htElement['deck_card_wrap'].offset()
			, endOffset = elTarget.offset()
			, welCard = $(makeCardHTML())
						.css('position', 'absolute')
						.offset({ left : startOffset.left
								, top : startOffset.top});

		$(document.body).append(welCard);

		// 공유 카드 영역에 카드 뿌릴 때의 처리
		if (bIsShareCard) {
			moveSecondCard(startOffset, endOffset);
		}

		welCard.animate({
			left : endOffset.left
			, top : endOffset.top
		}, nMoveTime, function() {
			if (typeof fCallback === 'function') {
				fCallback();
			}

			welCard.remove();
		});
	}

	function moveSecondCard(startOffset, endOffset) {
		var welSecondCard = $(makeCardHTML())
							.css('position', 'absolute')
							.offset({ left : startOffset.left
									, top : startOffset.top});
			
		$(document.body).append(welSecondCard);

		welSecondCard.animate({
			left : endOffset.left + 92
			, top : endOffset.top
		}, nMoveTime, function() {
			welSecondCard.remove();
		})
	}

	function emptyCardWrap() {
		htElement['user_card_wrap'].empty();
		htElement['opponent_card_wrap'].empty();
		htElement['share_card_wrap'].empty();
	}
	

	return {
		initialize : initialize
		, showShareCards : showShareCards
		, showOpponentCard : showOpponentCard
		, showBetLayer : showBetLayer
		, showGameLog : showGameLog
		, showOpponentInfo : showOpponentInfo
		, showMsg : showMsg
		, getData : getData
		, inputMsg : inputMsg
		, processGameReady : processGameReady
		, processGameStart : processGameStart
		, processGameInit : processGameInit
		, processGameBet : processGameBet
		, processGameBetGoldOk : processGameBetGoldOk
		, processGameStandOk : processGameStandOk
		, processGameOpponentStandOk : processGameOpponentStandOk
		, processGameGiveUpOk : processGameGiveUpOk
		, processGameOpponentGiveUpOk : processGameOpponentGiveUpOk
		, processGameEnd : processGameEnd		
	}
})();