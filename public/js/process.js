function start() {
	var token = document.getElementById("token").value;
	var accountId = document.getElementById("accountid").value;
	//override username and token
	now.setUsername(token);
	now.setPassword(accountId);
	
	hideLogin();
	//initialize console
	window.consoles = [];
	addConsole();
}

function hideLogin() {
	document.getElementById("login").style.display =  "none";
}

function showLogin() {
	document.getElementById("login").style.display = "block";
}

function addConsole() {
	var console = new Console(now, window.consoles.length);
	console.init();
	window.consoles.push(console);
}

function handleSelectCF(consoleIndex, selectedValue) {
	window.consoles[consoleIndex].getColumnFamily(selectedValue);
	return false;
}

function toObject(jsonString) {
	if (typeof jsonString === "string") {
		return eval("(" + jsonString + ")");
	} else {
		return jsonString;
	}
}

function addData(consoleIndex) {
	window.consoles[consoleIndex].addData();
}