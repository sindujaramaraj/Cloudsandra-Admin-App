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
	showProgressbar();
	document.body.className = "whitebg";
	document.getElementById("login").style.display =  "none";
	document.getElementById("adminConsole").style.display =  "block";
	//document.getElementById("token").value = "";
	//document.getElementById("accountid").value = "";
}

function showLogin() {
	document.body.className = "blackbg";
	document.getElementById("login").style.display = "block";
	document.getElementById("adminConsole").style.display =  "none";
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

function takeAction(action, consoleIndex) {
	window.consoles[consoleIndex][action]();
}

function rowSelected(consoleIndex, rowIndex) {
	window.consoles[consoleIndex].selectRow(rowIndex);
}

function logout() {
	now.setUsername("");
	now.setPassword("");
	delete window.consoles; 
}

function showProgressbar() {
	$("#progressbar").progressbar({
		value:100
	});
}

function hideProgressbar() {
	$("#progressbar").progressbar("destroy");
}

function setValueForAddColumnDialog(title, name, sortingType, isIndexed) {
	var addColumnDialog = document.getElementById("addColumnDialog");
	addColumnDialog.setAttribute("title", title);
	document.getElementById("colName").value = name;
	document.getElementById("colSortingType").value = sortingType;
	document.getElementById("indexSelect").value = sortingType;
}

function resetAddColumnDialog() {
	var addColumnDialog = document.getElementById("addColumnDialog");
	addColumnDialog.setAttribute("title", "Add Column");
	document.getElementById("colName").value = "";
	document.getElementById("colSortingType").selectedIndex = 0;
	document.getElementById("indexSelect").selectedIndex = 0;
}

function selectDataRow(consoleIndex, rowKey) {
	window.consoles[consoleIndex].selectDataRow(rowKey);
}