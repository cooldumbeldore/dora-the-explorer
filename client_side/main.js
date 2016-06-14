function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

function make_http_request(dir_name, callback, error_callback){
	var xhttp = createCORSRequest("GET","http://127.0.0.1:8080/"+dir_name+"/");
	xhttp.onreadystatechange=function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		var response_text = xhttp.responseText;
		callback(response_text);
	}
	if(xhttp.readyState == 4 && xhttp.status == 404){
		error_callback();
	}
	};

	if(!xhttp){
		console.log("CORS NOT SUPPORTED");
	}
	xhttp.send();
}

function clean_path(path){
	slash_count = 0
	for (var i = 0, len = str.length; i < len; i++) {
	 	if(str[i] =='/'){
	 		slash_count ++;
	 	}else{
	 		break;
	 	}
	}

	if(slash_count > 2){
		//cealn path;
	}
	return path;
}

function generate_on_click_event(key){
	function click_event(){
		path = key;
		if(global_path != "//"){
			path = global_path + path;
		}
		path = clean_path(path);
		handle_on_click(path);
	}
	return click_event;
}

function insert_to_table(value_dict){
	var tbody = $("<tbody></tbody>").appendTo('#file-table');
	tbody.attr("id","table-body");
	for (var key in value_dict) {
  		if (value_dict.hasOwnProperty(key)) {
	    	var tr =  $("<tr></tr>").appendTo(tbody);
	    	var name_td = $("<td>"+key+"</td>").appendTo(tr);
	    	name_td.addClass("file-name");
	    	name_td.click(generate_on_click_event(key));
	    	
	    	var size_td = $("<td>"+value_dict[key][0]+"</td>").appendTo(tr);
	    	size_td.addClass("file-size");

	    	var date_td = $("<td>"+value_dict[key][1]+"</td>").appendTo(tr);
	    	date_td.addClass("file-date");
	  	}
	}	

}


function process_response_text(response_text){
	file_dict = {}
	var html = $.parseHTML(response_text);
	var dom = $("<div></div>");
	dom.html(response_text);
	var title = $('h1',dom)[0].outerText;
	var table = $('table',dom);
	var trs = $('tr',table);
	trs.each(function (i, row) {
		tds = $('td', row);
		if(tds.length == 3){
			var name_td = tds[0];
			var name = $('a',name_td)[0].textContent;
			var date = tds[1].textContent;
			var size = tds[2].textContent;
			file_dict[name] = [size,date];
		}
	});

	
	return [file_dict, title];
}

function clear_table(){
	$("#table-body").remove();
}

function handle_on_click(dir_name){
	console.log(dir_name);
	clear_table();
	function callback(response_text){
		processed = process_response_text(response_text)
		insert_to_table(processed[0]);
		global_path = processed[1].substr(9, processed[1].length);
		global_last_paths.push(global_path);
		$("#main-header").text(processed[1]);
	}
	function error_callback(){
		alert("Invalid path!");
		value_dict = {"temp":["10k","3.3.3"]}
		insert_to_table(value_dict);
		$("#main-header").text("Index of (An example)");
	}
	response_text = make_http_request(dir_name, callback, error_callback);



}


function go_back(){
	global_last_paths.pop()
	handle_on_click(global_last_paths.pop());
}

global_path = ""
global_last_paths = []

function main(){
	global_path = "//";
	handle_on_click("");

	$("#go-back-button").click(go_back);
}

window.onload = function() {
    if (window.jQuery) {  
       	main();
    } else {
        alert("Error loading jQuery!");
    }
}
