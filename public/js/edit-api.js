function addTag(id) {
	var newtag = $("input[name=newtag]").val();
	$.ajax({
		url: "/addtag-api",
		data: {
			 'id': id
		    ,'newtag': newtag
		},
		async: false,
		dataType: "jsonp",
		success: function(data) {
			if (data.status === "success") {
				$(".taglist").append("<div class=\"tag\">"+data.tag+"</div>");
				$("input[name=newtag]").val('');
			} else {
				$("#alert").append("Error from API: " + data.error);
			}
		},
		error: function(xhr,textStatus,errorThrown) {
			$("#alert").append("Error on Ajax call:" + textStatus);
		}
	});
	return false;
}

function deleteTag(id, tag) {
	$.ajax({
		url: "/removetag-api",
		data: {
			 'id': id
		    ,'tag': tag
		},
		async: false,
		dataType: "jsonp",
		success: function(data) {
			if (data.status === "success") {
				var tagdiv = "#"+data.tag;
				$(tagdiv).remove();
			} else {
				$("#alert").append("Error from API: " + data.error);
			}
		},
		error: function(xhr,textStatus,errorThrown) {
			$("#alert").append("Error on Ajax call:" + textStatus);
		}
	});
	return false;
}

function deleteDocument(id, tag) {
	$.ajax({
		url: "/markdeleted-api",
		data: {
			 'id': id
		},
		async: false,
		dataType: "jsonp",
		success: function(data) {
			if (data.status === "success") {
				$("#alert").append("This document has been marked for deletion.");
			} else {
				$("#alert").append("Error from API: " + data.error);
			}
		},
		error: function(xhr,textStatus,errorThrown) {
			$("#alert").append("Error on Ajax call:" + textStatus);
		}
	});
	return false;
}

function unDeleteDocument(id, tag) {
	$.ajax({
		url: "/markundeleted-api",
		data: {
			 'id': id
		},
		async: false,
		dataType: "jsonp",
		success: function(data) {
			if (data.status === "success") {
				$("#alert").append("This document is no longer marked for deletion.");
			} else {
				$("#alert").append("Error from API: " + data.error);
			}
		},
		error: function(xhr,textStatus,errorThrown) {
			$("#alert").append("Error on Ajax call:" + textStatus);
		}
	});
	return false;
}

function setSequence(id) {
	var sequence = $("input[name=sequence]").val();
	var series_name = $("input[name=series_name]").val();
	if (isNaN(sequence)||(sequence===undefined)) {
		$("#alert").append("Chapter must be a number.");
		return false;
	}
	if (series_name===undefined) {
		$("#alert").append("Story name cannot be empty.");
		return false;
	}
	$.ajax({
		url: "/setsequence-api",
		data: {
			 'id': id
			,'sequence':sequence
			,'series_name':series_name
		},
		async: false,
		dataType: "jsonp",
		success: function(data) {
			if (data.status === "success") {
				$("#alert").append("Sequence updated.");
			} else {
				$("#alert").append("Error from API: " + data.error);
			}
		},
		error: function(xhr,textStatus,errorThrown) {
			$("#alert").append("Error on Ajax call:" + textStatus);
		}
	});
	return false;
}

function saveDocument(id, textbody, textsummary) {
	var jsondata = null;
	$.ajax({
		url: "/savedocument-api",
		data: {
			 'id': id,
			 'textdata': textbody,
			 'textsummary': textsummary
		},
		type: "post",
		dataType: "jsonp",
		success: function(data) {
			if (data.status === "success") {
				jsondata = data;
			} else {
				$("#alert").append("Error from API: " + data.error);
				return null;
			}
		},
		error: function(xhr,textStatus,errorThrown) {
			$("#alert").append("Error on Ajax call:" + xhr.responseText);
			return null;
		}
	});
	return jsondata;
}

function revertDocument(id) {
	var jsondata = null;
	$.ajax({
		url: "/revertdocument-api",
		data: {
			 'id': id
		},
		async: false,
		dataType: "jsonp",
		success: function(data) {
			if (data.status === "success") {
				jsondata =  data;
			} else {
				$("#alert").append("Error from API: " + data.error);
				return null;
			}
		},
		error: function(xhr,textStatus,errorThrown) {
			$("#alert").append("Error on Ajax call:" + textStatus);
			return null;
		}
	});
	return jsondata;
}
