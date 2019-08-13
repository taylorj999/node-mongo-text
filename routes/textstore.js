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

Textstore.prototype.covertInputToParams = function covertInputToParams(tags, fulltext, callback) {
	var params = {};
	// default to excluding all documents that have been marked for deletion
	// this will be overridden if the user has passed 'deleted' as a parameter
	params["deleted"] = {'$ne':true};

	// if the user passed input in the text search field, then we need to add that parameter
	if (fulltext!==undefined) {
		if (fulltext.length > 0) {
			params["$text"] = {'$search':fulltext};
		}
	}
	
	// if no tag value was passed, user provided no input, so return only the default parameters
	if (tags===null) {
		return callback(params);
	} else {
		var tagarray_positive = [];
		var tagarray_negative = [];
		var untag = false;
		
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
		// build the query for tags; we have to account for searching for untagged documents,
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

Textstore.prototype.buildQueryOptions = function buildQueryOptions(page,textsearch,
		                                                           orderby,callback) {
	var sort_options = {};
	var skip = 0;
	var limit = config.site.resultsPerPage;
	var return_vals = {'title':1,'tags':1,'summary':1,'original_date':1,'last_viewed':1,'story.chapter':1};
	
	if (page !== undefined) {
		if (!isNaN(page)) {
			if (page>0) {
				skip = config.site.resultsPerPage * (page - 1);
			}
		}
	}

	// if we are performing a text search then we need to add the "score" to the
	// return results for sorting and display purposes
	if (textsearch !== undefined) {
		if (textsearch.length > 0) {
			return_vals["score"] = {"$meta":"textScore"};
		}
	}
	
	// order by stuff here
	if (orderby === undefined) {
		sort_options["date"] = -1;
	} else {
		switch (orderby) {
			case "last":
				sort_options["last_viewed"] = 1;
				break;
			case "story":
				sort_options["story.chapter"] = 1;
				break;
			case "relevance":
				sort_options["score"] = {'$meta':'textScore'};
				break;
			case "recent":
			default:
				sort_options["original_date"] = -1;
				break;
		}
	}
	
	callback(sort_options, return_vals, skip, limit);
};

Textstore.prototype.getSearchResults = function getSearchResults(params, sort_options, 
																 return_vals, skip, 
																 limit, callback) {
	var self = this;
	// the aggregation pipeline generates 3 data facets: 'data' the actual search results after skip/limit
	// 'taglist' the list of tags found in the search results after skip/limit
	// 'count' the total number of search results (used for pagination)
	
	self.textdata.aggregate([{'$match':params},
	                         {'$project':return_vals},
	                         {'$sort':sort_options},
	                         {'$facet':
	                           {
	                    	   'data': [{'$match':{}},{'$skip':skip},{'$limit':limit}],
	                    	   'taglist': [{'$skip':skip},{'$limit':limit},{'$unwind':'$tags'},{'$sortByCount':'$tags'} ],
	                    	   'count': [{'$group':{'_id':null,'count':{'$sum':1}}}]
	                    	   }
	                         }])
	                         .toArray(function(err,results) {
	                    	   if (err) {
	                    		 return callback(err);
	                    	   } else {
	                    		 callback(err,results[0].data,results[0].count[0].count,results[0].taglist);
	                    	   }
	                         });
};

Textstore.prototype.getDocument = function getDocument(text_id, callback) {
	var textdata = this.textdata;
	textdata.findOneAndUpdate({'_id':new ObjectId(text_id)}
	                    ,{'$set':{'last_viewed':new Date()}}
	                    ,{'returnOriginal':false}
	                    ,callback);
};

Textstore.prototype.updateDocument = function updateDocument(text_id, new_text, new_summary, new_title, callback) {
	var textdata = this.textdata;
	textdata.findOne({'_id':new ObjectId(text_id)}, function(err, document) {
		if (err) {
			return callback(err);
		} else {
			old_text = document.current;
			textdata.findOneAndUpdate({'_id':new ObjectId(text_id)}
						             ,{'$set':{'current':new_text,'previous':old_text,
						        	           'summary':new_summary, 'title':new_title, 
						        	           'new':false}}
								     ,{'returnOriginal':false}
						             ,callback);
		}
	});
};

Textstore.prototype.newDocument = function newDocument(new_text, new_summary, new_title, callback) {
	var textdata = this.textdata;
	textdata.insertOne({'current':new_text,'summary':new_summary,'title':new_title,new:false,
		                'original_date':new Date(),'last_viewed':new Date()},
			           function(err,res) {
						  if (err) {
							  return callback(err);
						  } else {
							  console.dir(res);
							  return callback(null,res);
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
			textdata.findOneAndUpdate({'_id':new ObjectId(text_id)}
						             ,{'$set':{'current':new_text,'previous':old_text}}
								     ,{'returnOriginal':false}
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

Textstore.prototype.markDeleted = function markDeleted(doc_id, callback) {
	this.textdata.update({'_id':new ObjectId(doc_id)}
    				  ,{'$set':{'deleted':true}}
    				  ,{}
    				  ,callback);
};

Textstore.prototype.markUnDeleted = function markUnDeleted(doc_id, callback) {
	this.textdata.update({'_id':new ObjectId(doc_id)}
					  ,{'$set':{'deleted':false}}
    				  ,{}
    				  ,callback);
};

Textstore.prototype.updateSeriesCount = function updateSeriesCount(series_name, callback) {
	var self=this;
	if (series_name===undefined || series_name===null) {
		return callback(null);
	} else {
	  self.textdata.aggregate([{'$match':{'story.storyname':series_name,'deleted':{'$ne':true}}},
	                         {'$group':{'_id':'story.storyname','count':{'$sum':1}}}]
	                       ,function(err,result) {
	        	   if (err) {
	        		   return callback(err);
	        	   } else if (result[0].count===0) {
	        		   return callback(null);
	        	   } else {
	        		   self.textdata.update({'story.storyname':series_name}
	        			   				 ,{'$set':{'story.count':result[0].count}}
	        			   				 ,{'multi':true}
	        		   					 ,callback);
	        	   }
	           });
	}
};

Textstore.prototype.setSequence = function setSequence(doc_id, sequence, series_name, callback) {
	sequence = sequence*1; // explicitly type to integer
	var self=this;
	this.textdata.findOneAndUpdate({'_id':new ObjectId(doc_id)}
	                         ,{'$set':{'story.chapter':sequence,
	                	               'story.storyname':series_name}}
	                         ,{'returnOriginal':true}
	                         ,function(err,object) {
	                        	 if (err) {
	                        		 return callback(err);
	                        	 } else {
	                        		 // update the count for the series to maintain denormalization
	                        		 // with better data integrity this could be updated
	                        		 // to check only when the series name is changed
	                        		 // but this way it will 'clean up' any entries without counts
	                        		 var old_name;
	                        		 if (object.story === undefined) {
	                        			 old_name = null;
	                        		 } else {
	                        			 old_name = object.story.storyname;
	                        		 }
	                        		 self.updateSeriesCount(old_name
	                        				               ,function (err) {
		                        			 				 if (err) {
			                        			 				return callback(err);
			                        			 			 } else if (series_name != old_name){
			                        			 				self.updateSeriesCount(series_name
			                        			 			  			              ,callback);
			                        			 			 } else {
			                        			 				return callback(null);
			                        			 			 }
			                        		 			   });
	                        	 }
	                         });
};

Textstore.prototype.getSeriesList = function getSeriesList(page, limit, callback) {
	this.textdata.aggregate([{'$match':{'deleted':{'$ne':true},'story.storyname':{'$exists':true}}},
	                       {'$sort':{'story.chapter':1}},
	                       {'$group':{'_id':'$story.storyname'
	                                 ,'count':{'$sum':1}
	                                 ,'summary':{'$first':'$summary'}
	                                 ,'textid':{'$first':'$_id'}}},
	                       {'$sort':{'_id':1}}],function(err,result) {
							if (err) {
								return callback(err);
							} else {
								var sLength = result.length;
								if (sLength > (page * limit)) {
									result.length = page * limit;
								}
								if (page > 1) {
									result = result.splice((page-1)*limit,(page*limit)-1);
								}
								return callback(null,result,sLength);
							}
						 });
};

Textstore.prototype.getStoryChapter = function getStoryChapter(series, sequence, callback) {
	sequence = sequence * 1;
	this.textdata.findOneAndUpdate({'story.storyname':series,'story.chapter':sequence}
							  ,{'$set':{'last_viewed':new Date()}}
							  ,{'returnOriginal':false}
							  ,callback);
};

module.exports.Textstore = Textstore;