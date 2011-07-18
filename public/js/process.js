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

function callback_deleteDataRow() {
	var dataTable = document.getElementById("addRowDataTable");
	var rowLength = dataTable.rows.length;
	if (rowLength == 2) {
		return; //only one row
	}
	var toDeleteRow = dataTable.rows[rowLength - 1];
	var actionButtons = toDeleteRow.cells[2];
	var prevRow = dataTable.rows[rowLength - 2];
	//remove and add
	toDeleteRow.removeChild(actionButtons);
	prevRow.appendChild(actionButtons);
	dataTable.deleteRow(rowLength - 1);
}

function callback_addDataRow() {
	var dataTable = document.getElementById("addRowDataTable");
	var rowLength = dataTable.rows.length;
	var lastRow = dataTable.rows[rowLength - 1];
	var html = CFRow._DATAROWTEMPLATE.replace(/rowIndex/g, rowLength);
	
	var newRow = dataTable.insertRow(rowLength);
	newRow.innerHTML = html;
	
	var actionButtons = lastRow.cells[2];
	lastRow.removeChild(actionButtons);
	newRow.appendChild(actionButtons);
}

function getValueFromAddDataDialog() {
	var dataTable = document.getElementById("addRowDataTable");
	var dataRows = dataTable.rows;
	//construct data
	var data = {};
	data.rowKey = document.getElementById("rowKeyValue").value;
	data.rowData = {};
	for (var idx = 1, len = dataRows.length; idx < len; idx++) {
		var dataCells = dataRows[idx].cells;
		var key = dataCells[0].firstChild.value;
		var value = dataCells[1].firstChild.value;
		data.rowData[key] = value;
	}
	return data;
}

function resetAddDataDialog() {
	$("#rowKeyContainer").hide();
	document.getElementById("rowKeyValue").value = "";
	document.getElementById("addRowKey_1").value = "";
	document.getElementById("addRowValue_1").value = "";
	$("#deleteDataRow").unbind();
	$("#addDataRow").unbind();
	//remove rows
	var dataTable = document.getElementById("addRowDataTable");
	var rowLength = dataTable.rows.length;
	var lastRow = dataTable.rows[rowLength - 1];
	var actionButtons = lastRow.cells[2];
	lastRow.removeChild(actionButtons);
	//append to first row
	dataTable.rows[1].appendChild(actionButtons);
	
	while(rowLength > 2) {
		dataTable.deleteRow(rowLength - 1);
		rowLength--;
	}
}

function removeRowOptions() {
	var rowOptions = document.getElementById("rowOptions");
	rowOptions.parentNode.removeChild(rowOptions);
	document.getElementById("templates").appendChild(rowOptions);
	$("#deleteRowOption").unbind();
	$("#addDataOption").unbind();
	rowOptions.selectedIndex = 0;
}