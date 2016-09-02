var ObjectId = require('mongodb').ObjectID
   ,config = require('../config/config');

/*
textdata:
{
	_id: ...,
	new: true/false,
	original_date: date file was created/logged,
	last_date: date file was last modified,
	title: ...,
	summary: user provided file summary,
	source: original source of text file,
	tags: [ ],
	story:
	{
		storyname: ...,
		chapter: ...
	}
	current: text data given,
	previous: version before last edit if any
}
 */

function Textstore(db) {
	"use strict";
	
	// we use startsWith to check if tags have been passed with operators
	// so it would be nice to ensure it's actually there
	if ( typeof String.prototype.startsWith != 'function' ) {
		String.prototype.startsWith = function( str ) {
			return str.length > 0 && this.substring( 0, str.length ) === str;
		};
	}
	
	this.textdata = db.collection("textdata");
}

Textstore.prototype.covertTagsToParams = function convertParamsToQuery(tags, callback) {
	if (tags===null) {
		return callback({});
	} else {
		var params = {};
		var tagarray_positive = [];
		var tagarray_negative = [];
		var untag = false;
		
		// default to excluding all images that have been marked for deletion
		// this will be overridden if the user has passed 'deleted' as a parameter
		params["deleted"] = {'$ne':true};
		
		tags.forEach(function(item) {
			switch(item) {
				case "new":
					params["new"] = true;
					break;
				case "deleted":
					params["deleted"] = true;
					break;
				case "untagged":
					untag = true;
					break;
				default:
					if (item.startsWith('-')) {
						tagarray_negative[tagarray_negative.length] = item.substring(1,item.length);
					} else {
						tagarray_positive[tagarray_positive.length] = item;
					}
					break;
			}
		});
		// build the query for tags; we have to account for searching for untagged images,
		// as well as searching by positive, negative or both kinds of matching
		if (untag) {
			params["tags"] = {"$size":0};
		} else if ((tagarray_positive.length > 0) && (tagarray_negative.length === 0) ) {
			params["tags"] = {"$all": tagarray_positive};
		} else if ((tagarray_positive.length === 0) && (tagarray_negative.length > 0) ) {
			params["tags"] = {"$not" : {"$all" : tagarray_negative}};
		} else if ((tagarray_positive.length > 0) && (tagarray_negative.length > 0)) {
			params["$and"] = [{"tags" : {"$all": tagarray_positive}}, {"tags":{"$not" : {"$in" : tagarray_negative}}}];
		}
		
		return callback(params);
	}
};

Textstore.prototype.buildQueryOptions = function buildQueryOptions(page,orderby,callback) {
	var options = {};

	options["limit"] = config.site.resultsPerPage;
	
	if (page !== undefined) {
		if (!isNaN(page)) {
			if (page>0) {
				options["skip"] = config.site.resultsPerPage * (page - 1);
			}
		}
	}

	// order by stuff here
	if (orderby === undefined) {
		options["sort"] = [['date','desc']];
	} else {
		switch (orderby) {
			case "last":
				options["sort"] = [['last_viewed','asc']];
				break;
			case "story":
				options["sort"] = [['story.chapter','asc']];
				break;
			case "recent":
			default:
				options["sort"] = [['date','desc']];
				break;
		}
	}
	
	callback(options);
};

Textstore.prototype.getSearchResults = function getSearchResults(params, options, callback) {
	var textdata = this.textdata;
	var searchresults = textdata.find(params,{'title':true,'tags':true,'summary':true},options);
	searchresults.count(function(err,count) {
		if (err) {
			return callback(err);
		} else if (count===0) {
			return callback(null,null,0);
		} else {
			searchresults.toArray(function(err,results) {
				if (err) {
					return callback(err);
				} else {
					var taglist = {};
					for (x=0;x<results.length;x++) {
						if (results[x].tags !== undefined) {
							for(y=0;y<results[x].tags.length;y++) {
								taglist[results[x].tags[y]]=1;
							}
						}
					}
					callback(err,results,count,Object.keys(taglist));
				}
			});
		}
	});
};

Textstore.prototype.getDocument = function getDocument(text_id, callback) {
	var textdata = this.textdata;
	textdata.findAndModify({'_id':new ObjectId(text_id)}
	                    ,[]
	                    ,{'$set':{'last_viewed':new Date()}}
	                    ,{'new':true}
	                    ,callback);
};

Textstore.prototype.updateDocument = function updateDocument(text_id, new_text, new_summary, callback) {
	var textdata = this.textdata;
	textdata.findOne({'_id':new ObjectId(text_id)}, function(err, document) {
		if (err) {
			return callback(err);
		} else {
			old_text = document.current;
			textdata.findAndModify({'_id':new ObjectId(text_id)}
								  ,[]
						          ,{'$set':{'current':new_text,'previous':old_text,
						        	        'summary':new_summary, 'new':false}}
								  ,{'new':true}
						          ,callback);
		}
	});
};

Textstore.prototype.revertDocument = function updateDocument(text_id, callback) {
	var textdata = this.textdata;
	textdata.findOne({'_id':new ObjectId(text_id)}, function(err, document) {
		if (err) {
			return callback(err);
		} else {
			old_text = document.current;
			new_text = document.previous;
			textdata.findAndModify({'_id':new ObjectId(text_id)}
								  ,[]
						          ,{'$set':{'current':new_text,'previous':old_text}}
								  ,{'new':true}
						          ,callback);
		}
	});
};

Textstore.prototype.addTag = function addTag(text_id, tag, callback) {
	this.textdata.update({'_id':new ObjectId(text_id)}
	                  ,{'$addToSet':{'tags':tag},'$set':{'new':false}}
	                  ,{}
	                  ,callback);
};

Textstore.prototype.removeTag = function removeTag(text_id, tag, callback) {
	this.textdata.update({'_id':new ObjectId(text_id)}
    				   ,{'$pull':{'tags':tag},'$set':{'new':false}}
    				   ,{}
    				   ,callback);
};

module.exports.Textstore = Textstore;