// Initialize variables
var database = null;
var total = 0;
var males = 0;
var females = 0;
var datest = [];
var datesm = [];
var datesf = [];
var placest = [];
var placestC = [];
var placesm = [];
var placesmC = [];
var placesf = [];
var placesfC = [];
var corridt = [];
var corridtC = [];
var corridm = [];
var corridmC = [];
var corridf = [];
var corridfC = [];
var tipot = [];
var tipotC = [];
var tipom = [];
var tipomC = [];
var tipof = [];
var tipofC = [];

// Restructuring model
var all = null;

// Create a tree
function datesGenerator() {
	all = {"males":[], "female":[], "totals":[]}
	datum = (new Date()).getFullYear() + 1;
	for (var i = 2005; i < datum; i++) {
		for (var j = 0; j < 12; j++) {
			all['males'].push([i + (j/100.0),[0,0,0]]);
			all['female'].push([i + (j/100.0),[0,0,0]]);
			all['totals'].push([i + (j/100.0),[0,0,0]]);
		}
	}
}

// Need to have dictionaries
function arrayToDict(arra) {
	dict = {};
	for (var k = 0; k < arra.length; k++) {
		dict[arra[k]] = 0;
	}
	return dict;
}

// Making tree have branches
function treeSeed() {
	for (var i = 0; i < all['males'].length; i++) {
		all['males'][i][1][0] = arrayToDict(corridm);
		all['males'][i][1][1] = arrayToDict(tipom);
		all['males'][i][1][2] = arrayToDict(placesm);

		all['female'][i][1][0] = arrayToDict(corridf);
		all['female'][i][1][1] = arrayToDict(tipof);
		all['female'][i][1][2] = arrayToDict(placesf);
		
		all['totals'][i][1][0] = arrayToDict(corridt);
		all['totals'][i][1][1] = arrayToDict(tipot);
		all['totals'][i][1][2] = arrayToDict(placest);
	}
}

// Making tree have leaves
function dataRestructure(item, gender) {
	datum = new Date(item['Report date']);
	fecha = datum.getFullYear() + (datum.getMonth() / 100.0);
	for (var i = 0; i < all[gender]; i++) {
		if (fecha = all[gender][i][0]) {
			all[gender][i][1][0][item.Corridor.toLocaleLowerCase()] += 1;
			all[gender][i][1][1][item.Cod.toLocaleLowerCase()] += 1;
			all[gender][i][1][0][item.Country.toLocaleLowerCase()] += 1;
		}
	}
}

// Everything blooms now
function waterTheTree(db) {
	for (var item in db) {
		if (db[item].Gender == "male") {
			dataRestructure(db[item], 'males');
		}
		if (db[item].Gender == "female") {
			dataRestructure(db[item], 'female');
		}
		dataRestructure(db[item], 'totals');
	}
}

// Checks if an item is in a given array
function checkArray(dato, arra) {
	ctrl = 0;
	for (var i = 0; i < arra.length; i++) {
		if (arra[i] == dato) {
			ctrl++;
		}
	}
	if (ctrl > 0) {
		return true;
	} else {
		return false;
	}
}

// Fills the arrays with data
function filler(dato, count, arra) {
	var b = checkArray(dato, arra);
	if (!b) {
		arra.push(dato);
		count.push(0);
	}
	for (var i = 0; i < arra.length; i++) {
		if (arra[i] == dato) {
			count[i] += 1;
		}
	}
}

// Initialize the dates arrays
function datesInitializer() {
	datum = (new Date()).getFullYear() + 1;
	for (var i = 2005; i < datum; i++) {
		for (var j = 0; j < 12; j++) {
			datest.push([i + (j/100),0]);
			datesm.push([i + (j/100),0]);
			datesf.push([i + (j/100),0]);
		}
	}
}

// Fills the date data by month
function datador(dato, arra) {
	for (var i = 0; i < arra.length; i++) {
		if (arra[i][0] == dato) {
			arra[i][1] = arra[i][1] + 1;
		}
	}
}

// Extracts basic info from the database
function extractor(db) {
	for (var item in db) {

	// Initialize variables
	var mes = (new Date(db[item]["Report date"])).getMonth();
	var anio = (new Date(db[item]["Report date"])).getYear();
	var fecha = anio + (mes / 100);
	var condado = db[item].Country.toLocaleLowerCase();
	var corredor = db[item].Corridor.toLocaleLowerCase();
	var tipo = db[item].Cod.toLocaleLowerCase();
	var longitud = db[item].Long;
	var longitud = db[item].Lat;

	// Filter males and females
	if (db[item].Gender == "male") {
		males++;
		filler(condado, placesmC, placesm);
		filler(corredor, corridmC, corridm);
		filler(tipo, tipomC, tipom)
		datador(fecha, datesm);
	}			
	if (db[item].Gender == "female") {
		females++;
		filler(condado, placesfC, placesf);
		filler(corredor, corridfC, corridf);
		filler(tipo, tipofC, tipof);
		datador(fecha, datesf);			
	}
	}

	// Get totals
	filler(condado, placestC, placest);
	filler(corredor, corridtC, corridt);
	filler(tipo, tipotC, tipot);
	datador(fecha, datest);
}

// Building some data structures
function builder(array1, array2, array1C, array2C, array) {
	var table = [['gender','male','female']];
	for (var k = 0; k < (array.length + 1); k++) {
		var temp = [];
		temp.push(array[k]);
		temp.push(0);
		temp.push(0);
		for (var i = 0; i < array1.length; i++) {
			if (array[k] == array1[i]) {
				temp[1] = array1C[i];
			}
		}
		for (var j = 0; j < array2.length; j++) {
			if (array[k] == array2[j]) {
				temp[2] = array2C[j];
			}
		}
		table.push(temp);
	}		
	return table;
}

// d3.js graphics
function doubleBarGraph(datos, title, place) {

	var margin = {top: 10, right: 10, bottom: 25, left: 30},
	width = 600 - margin.left - margin.right,
	height = 350 - margin.top - margin.bottom;

	var x0 = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1);

	var x1 = d3.scale.ordinal();

	var y = d3.scale.linear()
	.range([height, 0]);

	var color = d3.scale.ordinal()
	.range(["#55aa55", "#99ff99"]);

	var xAxis = d3.svg.axis()
	.scale(x0)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.tickFormat(d3.format(".2s"));

	document.getElementById(place).innerHTML = "<p style='font: 20 px; font-family: sans-serif'><br>" + title + "</p>";

	var svg = d3.select("div#stats").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv(datos, function(error, data) {
		console.log("Datos burdos:");
		console.log(data);
		var generosG = d3.keys(data[0]).filter(function(key) { return key !== "gender"; });
		console.log("Extraccion de llaves (filtro: no gender):");
		console.log(generosG);

		data.forEach(function(d) {
			d.genero = generosG.map(function(name) { return {name: name, value: +d[name]}; });
		});
		console.log("Datos mappeados con los generos:")
		console.log(data);

		console.log("Datos mappeados con funcion para dominio:");
		console.log(data.map(function(d) { return d.gender; }));
		x0.domain(data.map(function(d) { return d.gender; }));
		x1.domain(generosG).rangeRoundBands([0, x0.rangeBand()]);
		y.domain([0, d3.max(data, function(d) { return d3.max(d.genero, function(d) { return d.value; }); })]);

		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

		svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Individuals");

		var state = svg.selectAll(".state")
		.data(data)
		.enter().append("g")
		.attr("class", "g")
		.attr("transform", function(d) {
			console.log(d);
			console.log(d.gender);
			console.log(x0(d.gender));
			return "translate(" + x0(d.gender) + ",0)"; });
		console.log("Aquella cosa que no se que hace:");			

		state.selectAll("rect")
		.data(function(d) { return d.genero; })
		.enter().append("rect")
		.attr("width", x1.rangeBand())
		.attr("x", function(d) { return x1(d.name); })
		.attr("y", function(d) { return y(d.value); })
		.attr("height", function(d) { return height - y(d.value); })
		.style("fill", function(d) { return color(d.name); });

		var legend = svg.selectAll(".legend")
		.data(generosG.slice().reverse())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color);

		legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) { return d; });

	});
}

/* 
The anatomy of the JSON should be like this:
data - {
	nombre: "county"
	genero: {
		name: "male"
		value: 123
	}
}
*/

function toJSON(ref0, ref1, ref2, cont1, cont2) {
	var jason = {};
	for (var i = 0; i < ref0.length; i++) {
		if (checkArray(ref0[i], ref1) || checkArray(ref0[i], ref2)) {
			var mf = [0,0];
			for (var j = 0; j < ref1.length; j++) {
				if (ref0[i] == ref1[j]) {
					mf[0] = count1[j];
				}
			}
			for (var k = 0; k < ref2.length; k++) {
				if (ref0[i] == ref2[k]) {
					mf[1] = count2[k];
				}
			}
			jason[i] = {'nombre': ref0[i], 'genero': {'name': 'male', 'value': mf[0]}};
			jason[i] = {'nombre': ref0[i], 'genero': {'name': 'female', 'value': mf[1]}};
		}
	}
	return jason;
}

function doubleBarGraphJSON(datos, title, place) {

	var margin = {top: 10, right: 10, bottom: 25, left: 30},
	width = 600 - margin.left - margin.right,
	height = 350 - margin.top - margin.bottom;

	var x0 = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1);

	var x1 = d3.scale.ordinal();

	var y = d3.scale.linear()
	.range([height, 0]);

	var color = d3.scale.ordinal()
	.range(["#55aa55", "#99ff99"]);

	var xAxis = d3.svg.axis()
	.scale(x0)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.tickFormat(d3.format(".2s"));

	document.getElementById(place).innerHTML = "<p style='font: 20 px; font-family: sans-serif'><br>" + title + "</p>";

	var svg = d3.select("div#stats").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.json(datos, function(error, data) {
		var generos = d3.keys(data[0]['genero']);

		x0.domain(data.map(function(d) { return d.nombre; }));
		x1.domain(generos).rangeRoundBands([0, x0.rangeBand()]);
		y.domain([0, d3.max(data, function(d) { return d3.max(d.genero, function(d) { return d.value; }); })]);

		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

		svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Individuals");

		var state = svg.selectAll(".state")
		.data(data)
		.enter().append("g")
		.attr("class", "g")
		.attr("transform", function(d) { return "translate(" + x0(d.nombre) + ",0)"; });

		state.selectAll("rect")
		.data(function(d) { return d.genero; })
		.enter().append("rect")
		.attr("width", x1.rangeBand())
		.attr("x", function(d) { return x1(d.name); })
		.attr("y", function(d) { return y(d.value); })
		.attr("height", function(d) { return height - y(d.value); })
		.style("fill", function(d) { return color(d.name); });

		var legend = svg.selectAll(".legend")
		.data(generos.slice().reverse())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color);

		legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) { return d; });

	});
}

// Transforming the data to a decent format for d3
function toCSV(tabla) {
	var csvContent = "data:text/csv;charset=utf-8,";
	tabla.forEach(function(infoArray, index) {
		dataString = infoArray.join(",");
		csvContent += index < infoArray.length ? dataString + "\n" : dataString;
	});
	var encodedUri = encodeURI(csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "tablita.csv");
	return link;
}

// Activates general graphics
function generals() {
	doubleBarGraph('tablita.csv', 'Deaths in various corridors across the border.', 'stats');
}	

// Activates special graphics
function specials() {
	document.getElementById('stats').innerHTML = "<p style='font: 20 px; font-family: sans-serif'><br>Under construction ...</p>";
}

$.ajaxSetup({ "async": false });
$.ajax({
	url:'http://safetrails.herokuapp.com/cases/index.php?limit=3000',
	dataType:'json',
	xhrFields: {
		withCredentials: false
	},
	type:'GET',
	success:function(data){
		// Extract info
		database = data;
	}
});
$.ajaxSetup({ "async": true });

// Let's do some magic
datesInitializer();
datesGenerator();
total = Object.keys(database).length;

// Extracting data one item at a time
extractor(database);

// Building tree
treeSeed();
waterTheTree(database);


//graphics();