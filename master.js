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
			, aMember : []}		
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
		var htRoom = getRoomById(sRoomId);
		return htRoom.aMember;
	}
}