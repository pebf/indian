var Master = module.exports = {
	n_START_GOLD : 25
	, aUsers : []
	, aRooms : []
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

	, hasRoom : function (sRoomName) {
		var aFilteredRoom = this.rooms.filter(function (htRoom) {
			return (htRoom.sName === sRoomName)
		});

		if (aFilteredRooms.length > 0) {
			return true;

		} else {
			return false;
		}
	}

	, addRoom : function (sRoomName) {
		this.rooms.push({
			name : sRoomName
			, member : []
		});
	}

	, getRoomList : function () {
		return this.aRooms;
	}
}