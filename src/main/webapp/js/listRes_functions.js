var fileUpload = {};

var openedLDPC = {};
	openedLDPC.URI = "";
	openedLDPC.store = null;
	openedLDPC.contentTriples = [];
	openedLDPC.resourceList = [];
	
var currActionTab = "listNav";

Sunlight.registerLanguage("turtle", turtleLanguage);
Sunlight.globalOptions.lineNumbers = false;
Sunlight.globalOptions.maxHeight = 265;
Sunlight.globalOptions.showMenu = true;

$(document).ready(function() {
	
	// Clicking on the Open/Create tabs
	$('#actionTypeTabNav a').click(function (e) {
		hideMessages();
		currActionTab = this.id;
		e.preventDefault();
		$(this).tab('show');
	});
	$('#turtlePreviewTab').click(function (e) { e.preventDefault();$(this).tab('show');});
	$('#uduvuduPreview').click(function (e) { e.preventDefault();$(this).tab('show');});
	
	// Loading visualizer for preview
	$("#visualizer").load("templates/visualizer.html");
	
	// Hiding preview panel
	$("#resourcePreviewPanel").hide();

	// Example turtle dropdown
	$('input[type=radio][name=contentType]').change(function(){
		($(this).val() == 'text/turtle') ? $('#paste-text').fadeIn() : $('#paste-text').fadeOut();
	});	
	
	// File upload initialization
	initDropArea();
	
	// Setting default values from the query string
	setDefaultsFromQStr();
	
	// History.js - bind to StateChange Event
  History.Adapter.bind(window,'statechange',function(){ var State = History.getState(); });
	
	// Init functionality of connected input fields
	initContainerInputSync();
	
	$("#listContainer").keyup(function (e) { if (e.keyCode == 13) { listFromInput(); } });

});

function initDropArea(){
	Dropzone.options.dropArea = {
		accept: function(file, done) {
			startLoading();
			fileUpload = {};
			$('#dropArea').empty();
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				if (file) {
					var message = '<b>File selected:</b> ' + file.name + ' (' + file.size;
					if(file.size > 2) { message += ' bytes)'; }
					else { message += ' byte)'; }
					$('#dropArea').html(message);
					fileUpload.fileContent = file;
					fileUpload.fileName = file.name;
					fileUpload.fileType = file.type;
					stopLoading();
				}
				else {
					$('#dropArea').html('Failed to load file. Please try again.');
					stopLoading();
				}
			}
			else {
				$('#dropArea').html('File reading is not supported in your browser!');
				stopLoading();
			}
		}
	};
}

function resetDropArea() {
	fileUpload = {};
	$('#dropArea').empty();
	$('#dropArea').html('Drop something here');
	$('#dropArea').removeClass('dz-started');
}

function setDefaultsFromQStr() {
	var defaultContainer = getURLParameter("defaultContainer");
	if(defaultContainer.length > 0) {
		setDefaultContainer(defaultContainer);
	}
	else {
		var platformURI = getURLParameter("platformURI");
		if(platformURI.length > 0) {
			P3Platform.getPlatform(platformURI).then(function(p) {
				setDefaultContainer(p.getLdpRoot());
			});
		}
		else {
			History.pushState({dc:""}, "", "");
		}
	}
}

function setDefaultContainer(defaultContainer) {
		$('#listContainer').val(defaultContainer);
		$('#addContainer').val(defaultContainer);
		$('#uploadContainer').val(defaultContainer);
		listFromInput();
		History.pushState({dc: defaultContainer}, "", "?defaultContainer="+defaultContainer);	
}

function initContainerInputSync() {
	$('#listContainer').bind('change',function(){ setValueFromMasterInput('listContainer', ['addContainer','uploadContainer']); });
	$('#addContainer').bind('change',function(){ setValueFromMasterInput('addContainer', ['listContainer','uploadContainer']); });
	$('#uploadContainer').bind('change',function(){ setValueFromMasterInput('uploadContainer', ['listContainer','addContainer']); });
}

function setValueFromMasterInput(masterInputId, inputIdArray) {
	var newValue = $('#'+masterInputId).val();
	for (var i=0; i<inputIdArray.length; i++) {
		$('#'+inputIdArray[i]).val(newValue);
	}
}

function getURLParameter(paramName){
	var result = [];
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++){
		var parameterName = sURLVariables[i].split('=');
		if (parameterName[0] === paramName){
			result.push(decodeURIComponent(parameterName[1]));
		}
	}
	return result;
}

function pasteExample(ind) {
	$('#textInput').val(turtleExamples[ind]);
}

/* View resources */

function viewResource() {
	hideMessages();
	$("#resourcePreviewPanel").hide();
					
	var container = $("#resourceList").val();
	
	if($.trim(container) == "") {
		showMessage("list-alert", "Select a resource");
	}
	else {
		startLoading();
	
		var ajaxRequest = $.ajax({	type: "GET",
									url: container,
									cache: false	});
		
		ajaxRequest.done(function(response, textStatus, request) {
			if(request.getResponseHeader("Content-Type")=="text/turtle") {
				var store = rdfstore.create();
				store.load('text/turtle', response, function(success, results) {
					if(success) {
						$("#turtlePreview").empty().append('<div class="sunlight-highlight-turtle">'+ escapeNoddedStr(response)+'</div>');
						Sunlight.highlightAll();
						
						$("#uduvuduPreview").html(uduvudu.process(store));
						$("#linkToFile").empty().html('<span class="previewMessage"><a href="'+container+'" target="_blank">Direct link to file</a></span>');
						
						$('#visDropdown a[href="#turtlePreview"]').tab('show');
						$("#resourcePreviewPanel").show();
					}
					else {
						showMessage("list-alert", "Something went wrong during loading the response to the RDF store.");
					}
					stopLoading();
				});
			}
			else {						
				$("#turtlePreview").empty().html('<span class="previewMessage">Only files with content-type "text/turtle" can be shown here</span>');
				$("#uduvuduPreview").empty().html('<span class="previewMessage">Only files with content-type "text/turtle" can be shown here</span>');
				$("#linkToFile").empty().html('<span class="previewMessage"><a href="'+container+'" target="_blank">Direct link to file</a></span>');
				$('#visDropdown a[href="#linkToFile"]').tab('show');
				$("#resourcePreviewPanel").show();
				stopLoading();
			}
		});
		ajaxRequest.fail(function(response, textStatus, statusLabel){
			showErrorMessage("list-alert", response, statusLabel);
			stopLoading();
		});
	}
}

/* Listing resources */

function listFromList() {	
	hideMessages();
	
	var container = $("#resourceList").val();
	
	if($.trim(container) == "") {
		showMessage("list-alert", "Pick a container");
	}
	else {
		$("#listContainer").val(container).trigger("change");
		getResourceList(container);
	}
}

function listFromInput() {
	
	hideMessages();
	
	// var container = ignoreEndSlashes($("#listContainer").val());
        var container = $("#listContainer").val();
	$("#listContainer").val(container).trigger("change");
	
	if($.trim(container) == "") {
		showMessage("list-alert", "Enter a container");
	}
	else {
		getResourceList(container);
	}
}

function getResourceList(container) {

	$('#resourceList').html('');
	$('#contentVis').hide();
	$("#resourcePreviewPanel").hide();
	
	startLoading();
	
	var ajaxRequest = $.ajax({	type: "GET",
					url: container,
                                        headers: { "Accept": "text/turtle" },
					cache: false	 });	
		
	ajaxRequest.done(function(response, textStatus, request) {
		openedLDPC.URI = container;			
		openedLDPC.store = rdfstore.create();
		openedLDPC.store.load('text/turtle', response, function(success) {
			if(success) {
				extractResourceList(openedLDPC.store);
				History.pushState({dc: container}, "", "?defaultContainer="+container);
			}
			else {
				showMessage("list-alert", "Something went wrong during loading the response to the RDF store.");
			}
			stopLoading();
		});
	});
	ajaxRequest.fail(function(response, textStatus, statusLabel){
		showErrorMessage("list-alert", response, statusLabel);
		stopLoading();
	});
}

function extractResourceList(store) {
	openedLDPC.resourceList = [];
    var query = 'SELECT ?o { <'+openedLDPC.URI+'> <http://www.w3.org/ns/ldp#contains> ?o }';
	store.execute(query, function(success, results) {
		if (success) {
			hideResourceModButtons();
			if(results.length>0) {
				for(var i=0;i<results.length;i++){
					openedLDPC.resourceList.push(results[i].o.value);
				}
				$('#contentVis').show();
				listResources();
				showResourceModButtons();
			}
			else {
				showMessage("list-alert", 'This container doesn\'t contain any resources.');
			}
		}
	});
}

function listResources() {
	for(var i=0;i<openedLDPC.resourceList.length;i++){
		$('#resourceList').append('<option id="'+openedLDPC.resourceList[i]+'" title="'+openedLDPC.resourceList[i]+'">'+openedLDPC.resourceList[i]+'</option>');
	}
	$('#resourceList option:first-child').prop('selected', true);
}

function hideResourceModButtons() {
	$('#listResourceBtn').hide();
	$('#viewResourceBtn').hide();
	$('#deleteResourceBtn').hide();
}

function showResourceModButtons() {
	$('#listResourceBtn').show();
	$('#viewResourceBtn').show();
	$('#deleteResourceBtn').show();
}

/* Delete resources from the container */

function deleteResource() {
	if( confirm('Are you sure you want to delete the selected resource?') ) {
	
		hideMessages();
		$("#resourcePreviewPanel").hide();
		startLoading();
		
		var selectedRes = $('#resourceList').val();
		
		if($.trim(selectedRes) == "") {
			showMessage("resmod-alert", "Select a resource!");
		}
		else {
			var ajaxRequest = $.ajax({	type: "DELETE",
										url: selectedRes });
										
			ajaxRequest.done(function(response, textStatus, request){
				$('#resourceList').find('option:selected').remove();
				if( $('#resourceList').has('option').length > 0 ) {
					$('#resourceList option:first-child').prop('selected', true);
				}
				else {
					$('#contentVis').hide();
				}
				showMessage("resmod-success", "Resource successfully deleted.");
				stopLoading();
			});
			ajaxRequest.fail(function(response, textStatus, statusLabel){
				showErrorMessage("resmod-alert", response, statusLabel);
				stopLoading();
			});
		}
	}
}

/* Adding new a resource to the container */

function addFromTextarea() {

	hideMessages();
	startLoading();

	var container = $("#addContainer").val();
	
	var tentativeName = $("#addSlug").val();
	var textData = $("#textInput").val();
        
        var linkType;
        if (/(Basic|Direct)Container/.test(textData))
          linkType = '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"';
        else
          linkType = '<http://www.w3.org/ns/ldp#Resource> ; rel="type"';
	
	var headerCollection = {};
	headerCollection['text/plain'] = { "Slug" : tentativeName, "Link" : linkType };
	headerCollection['text/turtle'] = { "Slug" : tentativeName, "Link" : linkType };
	
	var actContentType = $('input[name=contentType]:checked').val();
	
	saveContent(container, textData, headerCollection[actContentType], actContentType, saveTextualContentSuccess, saveTextualContentFail);
}

function addFromFileUpload() {
	if(!$.isEmptyObject(fileUpload)){

		hideMessages();
		startLoading();
		
		var container = $("#uploadContainer").val();
		var data = fileUpload.fileContent;
		var tentativeName = fileUpload.fileName;
		var actContentType = fileUpload.fileType;
		var header =  { "Slug" : tentativeName };
		
		saveContent(container, data, header, actContentType, saveFileSuccess, saveFileFail);

	}
	else {
		showMessage("upload-alert", "No file selected");
	}
}

function saveFileSuccess(response, textStatus, request) {
	// Getting the name of the created resource & letting the user know about the successful creation
	resetDropArea();
	var actualContainer = request.getResponseHeader('Location');
	if(actualContainer != null) {
		showMessage("upload-success", "Content is successfully saved here: <b>" + actualContainer + "</b>");
	}
	else {
		showMessage("upload-success", "Content is successfully saved.");
	}
	stopLoading();
}

function saveFileFail(response, textStatus, statusLabel) {
	showErrorMessage("upload-alert", response, statusLabel);
	stopLoading();
}

function saveTextualContentSuccess(response, textStatus, request) {
	// Getting the name of the created resource & letting the user know about the successful creation
	var actualContainer = request.getResponseHeader('Location');
	if(actualContainer != null) {
		showMessage("add-success", "Content is successfully saved here: <b>" + actualContainer + "</b>");
	}
	else {
		showMessage("add-success", "Content is successfully saved.");
	}
	stopLoading();
}

function saveTextualContentFail(response, textStatus, statusLabel) {
	showErrorMessage("add-alert", response, statusLabel);
	stopLoading();
}

function saveContent(container, data, headers, contentType, saveSuccess, saveFail) {
	
	var ajaxRequest = $.ajax({	type: "POST",
								url: container,
								data: data,
								headers: headers,
								contentType: contentType,
								processData: false
							});	
	
	ajaxRequest.done(function(response, textStatus, request){
		saveSuccess(response, textStatus, request);
	});
	ajaxRequest.fail(function(response, textStatus, statusLabel){
		saveFail(response, textStatus, statusLabel);
	});
}

/* General stuff */

function escapeNoddedStr(str) {
	return str.replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); /*.replace(/\n/g,'<br>');*/
}

function showMessage(elementId, message, closeable) {
	
	closeable = setDefaultValue(closeable, true);
	
	if(closeable) {
	    $('#'+elementId).html('<a href="#" class="close" id="'+elementId+'-close">&times;</a>'+message).show();
		$('#'+elementId+'-close').click(function(){
			$('#'+elementId).hide();
		});
	}
	else {
		$('#'+elementId).html('').html(message).show();
	}
}

function showErrorMessage(elementId, response, statusLabel, fallbackMessage) {

	fallbackMessage = setDefaultValue(fallbackMessage, "Something went wrong...");

	if(typeof response.responseText !== 'undefined' && response.responseText.length > 0 ) {
		showMessage(elementId, response.responseText);
	}
	else if(typeof statusLabel !== 'undefined' && statusLabel.length > 0) {
		showMessage(elementId, statusLabel);
	}
	else {
		showMessage(elementId, fallbackMessage);
	}
}

function setDefaultValue(variable, defaultValue) {
	return typeof variable !== 'undefined' ? variable : defaultValue;
}

function hideMessage(elementId) {
	$('#'+elementId).html('').hide();
}

function hideMessages() {
	hideMessage("resmod-success");
	hideMessage("resmod-alert");
	hideMessage("list-success");
	hideMessage("list-alert");
	hideMessage("add-success");
	hideMessage("add-alert");
	hideMessage("upload-success");
	hideMessage("upload-alert");
	hideMessage("save-success");
	hideMessage("save-alert");
	hideMessage("open-alert");
}

function startLoading() {
	$('html,body').css('cursor','wait');
}

function stopLoading() {
	$('html,body').css('cursor','auto');
}

function ignoreEndSlashes(str) {
	while(str.length > 0 && str[str.length-1] == "/") {
		str = str.substring(0,str.length-1);
	}
	return str;
}

