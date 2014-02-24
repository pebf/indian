indian.che.ui = (function() {
	var htElement = {};

	function initialize () {
		resizeBrowser();
		assignHTML();
	}

	function resizeBrowser () {
		window.resizeTo(1024, 696);
	}

	function assignHTML() {
		htElement['header'] = $(document.body).find('> ._header');

		htElement['game'] = $(document.body).find('> ._game');
		htElement['user_hand'] = htElement['game'].find('> ._user_hand');
		htElement['user_card_wrap'] = htElement['user_hand'].find('>._card_wrap');
		htElement['opponent_hand'] = htElement['game'].find('> ._oppenent_hand');
		htElement['opponent_card_wrap'] = htElement['opponent_hand'].find('>._card_wrap');
		htElement['board'] = htElement['game'].find('> .game_ct > ._board');

		htElement['board_top'] = htElement['board'].find('._top_area');
		htElement['share_card_wrap'] = htElement['board_top'].find('._card_wrap');

		htElement['board_btm'] = htElement['board'].find('._btm_area');
		htElement['deck_card_wrap'] = htElement['board_btm'].find('._card_wrap');

		htElement['board_card_wrap'] = htElement['board'].find('._card_wrap');

		htElement['msg_area'] = $(document.body).find('> ._msg_area');		
		htElement['game_log'] = htElement['msg_area'].find('._game_log_content');
	}

	function showShareCards(aShareCards) {
		console.log('aShareCards = ' + aShareCards);

		var welCard1 = makeCardHTML(aShareCards[0])
			, welCard2 = makeCardHTML(aShareCards[1]);

		htElement['share_card_wrap'].append(welCard1)
									.append(welCard2);
	}

	function showOpponentCard(nUserCard, nOpponentCard) {
		console.log('userCard = ' + nUserCard);
		console.log('opponentCards = ' + nOpponentCard);
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
				sMsg  = '게임을 시작합니다.'
				break;
			case 'dealout_card' :
				sMsg = '카드를 배분합니다.'
				break;
		}
		
		htElement['game_log'].append('<p>' + sMsg + '</p>');
	}

	function showChooseLayer() {
		var elChooseLayer = $('body > ._choose_layer')
			, nLeft = ($(document).width() - elChooseLayer.width()) / 2;
		
		elChooseLayer.css('left', nLeft);
		elChooseLayer.show();
	}	

	return {
		initialize : initialize
		, showShareCards : showShareCards
		, showOpponentCard : showOpponentCard
		, showChooseLayer : showChooseLayer
		, showGameLog : showGameLog
	}

})();