indian.che.ui = (function() {
	var Socket
		, htElement = {}		
		, htData = {};

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

		htElement['board'] = htElement['game'].find('> .game_ct > ._middle_area > ._board');
		htElement['board_top'] = htElement['board'].find('._top_area');
		htElement['share_card_wrap'] = htElement['board_top'].find('._card_wrap');

		htElement['board_btm'] = htElement['board'].find('._btm_area');
		htElement['deck_card_wrap'] = htElement['board_btm'].find('._card_wrap');
		htElement['board_card_wrap'] = htElement['board'].find('._card_wrap');

		htElement['msg_area'] = $(document.body).find('> ._msg_area');
		htElement['game_log'] = htElement['msg_area'].find('._game_log_content');
		htElement['chat_box'] = htElement['msg_area'].find('._chat_content');

		htElement['bet_layer'] = $('body > ._bet_layer');
		htElement['bet_gold_layer'] = $('body > ._bet_gold_layer');
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
		showShareCards(htData.aShareCards);
		showGameLog('game_show_share_cards', {aShareCards : htData.aShareCards});

		showOpponentCard(htData.nOpponentCard);
		showGameLog('game_show_opponent_card', {nOpponentCard : htData.nOpponentCard});
	}

	function processGameBet(bIsFirstBet) {
		showBetLayer(bIsFirstBet);
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
			, welGold = welPlayerBox.find('> ._player_box_body  ._ganet');

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
			makeCardHTML(''. true) : makeCardHTML(nUserCard);

		htElement['user_card_wrap'].html(welCard);
	}

	function makeCardHTML(nNum, bIsBack) {
		var aCardHTML = []
			, sBack = bIsBack ? 'back' : ''
			, sNum = nNum ? '<span>' + nNum + '</span>' : '';

		aCardHTML.push('<div class="card ' + sBack + '">');
		aCardHTML.push('<div class="card_inner">' + sNum  + '</div></div>');
		return $(aCardHTML.join(''));
	}

	function showGameLog(sCode, htOption) {
		var sMsg;

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
				sMsg = '상대방 배팅 중 입니다';
				break;
		}
		
		htElement['game_log'].append('<p>' + sMsg + '</p>');
	}

	function showMsg(htData) {
		var sMsg = '<p>' + htData.sUserName + ' : ' + htData.sMsg + '</p>'
			, elChatBox = htElement['chat_box'][0];
		
		htElement['chat_box'].append(sMsg);
		elChatBox.scrollTop = elChatBox.scrollHeight;
	}

	function showBetLayer(bIsFirstBet) {
		var welBetLayer = htElement['bet_layer']
			, nLeft = ($(document).width() - welBetLayer.width()) / 2;

		if (bIsFirstBet) {
			welBetLayer.find('> ._stand').hide();
			welBetLayer.find('> ._give_up').hide();
		}
		
		welBetLayer.css('left', nLeft)
				.show();
	}

	function clickBetBtn(welTarget) {
		if (welTarget.hasClass('_bet') {
			htElement['bet_layer'].hide();
			htElement['bet_gold_layer'].show();

		} else if (welTarget.hasClass('_stand') {
			Socket.sendGameStand();

		} else if (welTarget.hasClass('_give_up') {
			Socket.sendGameGiveUp();
		}
	}

	function clickBetGoldBtn(welTarget) {
		if (welTarget.hasClass('_ok')) {
			betGold(welTarget);

		} else if (welTarget.hasClass('_cancel')) {

		}
	}

	function betGold(welTarget) {
		var nGold = welTarget.prev().val() - 0
			, nUserGold = getData('usergold');

		if (!nGold) {
			alert('배팅할 금액을 입력해주세요');
			return;

		} else if (nGold > nUserGold) {
			alert('가지고 있는 골드를 초과하여 배팅할 수 없습니다');
			return;
		}

		Socket.sendGameBetGold(nGold);			
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
	}

})();