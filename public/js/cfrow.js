function CFRow(consoleIndex, rowData) {
	this._consoleIndex = consoleIndex;
	this._data = rowData;
	this._key = rowData.KEY;
	this._keyValuePairs = [];
	for (var name in this._data) {
		if (name == "KEY") {
			continue;
		}
		this._keyValuePairs.push(new KeyValuePair(name, this._data[name]));
	}
}

CFRow.prototype.getKey = function() {
	return this._key;
}

CFRow.prototype.getHtml = function() {
	var html = "<tr>";
	html += "<td class='rowkey' id='rowKey_" + this._key + "' onclick='selectDataRow(" + this._consoleIndex + ",\"" + this._key + "\")'>" + this._key + "</td>";
	html += "<td class='rowvalue'>"
				+ "<div class='keyvalueContainer'>";
	for (idx = 0, len = this._keyValuePairs.length; idx < len; idx++) {
		html += this._keyValuePairs[idx].getHtml(); 
	}
	html += "<div class='clear'></div></div></td></tr>";
	return html;
				
}

CFRow.prototype.showOptions = function(optionsButton) {
	var rowKeyElement = document.getElementById('rowKey_' + this._key);
	optionsButton.parentNode.removeChild(optionsButton);
	optionsButton.onclick = callback_optionButtonClick(this);
	rowKeyElement.appendChild(optionsButton);
}

function callback_optionButtonClick(instance) {
	return function() {
		instance.deleteRow();
	}
}

CFRow.prototype.deleteRow = function() {
	window.consoles[this._consoleIndex].deleteRow(this._key);
}

function KeyValuePair(key, value) {
	this._key = key;
	this._value = value;
}

KeyValuePair.prototype.getHtml = function() {
	var html = "<div class='keyvalue'><span class='key'>" + this._key + "</span>"
						+ "<span class='value'>" + this._value + "</span></div>";
	return html;
}