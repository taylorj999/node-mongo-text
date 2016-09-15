var Textstore = require('./textstore').Textstore
   ,Tags = require('./tags').Tags
   ,striptags = require('striptags')
   ,config = require('../config/config')
   ,validator = require('validator')
   ,sanitizers = require('../config/sanitizers');

module.exports = exports = function(app, db, passport) {
	"use strict";
	
	app.get('/',function(req,res) {
		res.render('index', {'user':req.user});
	});
	
	app.get('/login', function(req,res) {
		res.render('login', { message: req.flash('loginMessage')});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the login page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/signup', function(req, res) {
		res.render('signup', { message: req.flash('signupMessage')});
	});
	
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/profile', isLoggedIn, function(req, res){
		res.render('profile',{'user':req.user});
	});
	
	app.get('/logout', function(req,res) {
		req.logout();
		res.redirect('/');
	});
	
	app.post('/search', function(req,res) {
		var params = {};
		if (req.body.tags !== undefined) {
			params.tags = sanitize(req.body.tags, sanitizers.allow_spaces).toLowerCase();
		}
		if (req.body.fulltext !== undefined) {
			params.fulltext = sanitize(req.body.fulltext, sanitizers.text_search);
		}
		if (req.body.page !== undefined) {
			params.page = sanitize(req.body.page);
		}
		if (req.body.sortby !== undefined) {
			params.sortby = sanitize(req.body.sortby).toLowerCase();
		}
		if (req.body.story != undefined) {
			params.story = sanitize(req.body.story);
		}
		doSearch(params,req,res,db);
	});
	app.get('/search', function(req,res) {
		var params = {};
		if (req.query.tags !== undefined) {
			params.tags = sanitize(req.query.tags, sanitizers.allow_spaces).toLowerCase();
		}
		if (req.query.fulltext !== undefined) {
			params.fulltext = sanitize(req.query.fulltext, sanitizers.text_search);
		}
		if (req.query.page !== undefined) {
			params.page = sanitize(req.query.page);
		}
		if (req.query.sortby !== undefined) {
			params.sortby = sanitize(req.query.sortby).toLowerCase();
		}
		if (req.query.story != undefined) {
			params.story = sanitize(req.query.story);
		}
		doSearch(params,req,res,db);
	});
	
	app.get('/document', function(req,res) {
		var textstore = new Textstore(db);
		if ((req.query.id === undefined)&&(req.query.story === undefined)) {
			res.render('document',{'error':'Invalid parameter error'});
		} else if (req.query.id === undefined) {
			textstore.getStoryChapter(sanitize(req.query.story)
					                 ,sanitize(req.query.chapter)
					                 ,function(err,result) {
									if (result.value) {
										if (result.value.current !== undefined) {
											result.value.current = striptags(result.value.current);
										}
									}
									if (err) {
										res.render('document',{'error':err.message
											               ,'textdata':result.value
											               ,'user':req.user
											               ,'config':config.site});
									    return;
									} else {
										res.render('document',{'textdata':result.value
								                           ,'user':req.user
								                           ,'config':config.site});
										return;
									}
			});
		} else {
			textstore.getDocument(sanitize(req.query.id).toLowerCase(), function(err,result) {
				if (result.value) {
					if (result.value.current !== undefined) {
						result.value.current = striptags(result.value.current);
					}
				}
				if (err) {
					res.render('document',{'error':err.message
								   	   ,'textdata':result.value
								       ,'user':req.user
								       ,'config':config.site});
				    return;
			    } else {
				    res.render('document',{'textdata':result.value
								       ,'user':req.user
								       ,'config':config.site});
				    return;
			    }
			});
		}
	});
			
	app.get('/addtag-api', function(req,res) {
		if ((req.query.id === undefined)||(req.query.newtag === undefined)) {
			res.jsonp({'status':'error','error':'Invalid parameter error.'});
			return;
		} else if (config.system.reservedTags.indexOf(sanitize(req.query.newtag).toLowerCase()) >= 0) {
			res.jsonp({'status':'error','error':'Reserved keyword.'});
			return;
		} else {
			var textstore = new Textstore(db);
			textstore.addTag(sanitize(req.query.id).toLowerCase()
					      ,sanitize(req.query.newtag).toLowerCase()
					      ,function(err) {
				if (err) {
					res.jsonp({'status':'error','error':err.message});
					return;
				} else {
					res.jsonp({'status':'success','tag':sanitize(req.query.newtag).toLowerCase()});
					return;
				} 
			});
		}
	});

	app.get('/removetag-api', function(req,res) {
		if ((req.query.id === undefined)||(req.query.tag === undefined)) {
			res.jsonp({'status':'error','error':'Invalid parameter error.'});
			return;
		} else {
			var textstore = new Textstore(db);
			textstore.removeTag(sanitize(req.query.id).toLowerCase()
					         ,sanitize(req.query.tag).toLowerCase()
					         ,function(err) {
				if (err) {
					res.jsonp({'status':'error','error':err.message});
					return;
				} else {
					res.jsonp({'status':'success', 'tag':sanitize(req.query.tag)});
					return;
				} 
			});
		}
	});

	app.get('/markdeleted-api', function(req,res) {
		if (req.query.id === undefined) {
			res.jsonp({'status':'error','error':'Invalid parameter error.'});
			return;
		} else {
			var textstore = new Textstore(db);
			textstore.markDeleted(sanitize(req.query.id).toLowerCase(), function(err) {
				if (err) {
					res.jsonp({'status':'error','error':err.message});
					return;
				} else {
					res.jsonp({'status':'success'});
					return;
				} 
			});
		}
	});
	
	app.get('/markundeleted-api', function(req,res) {
		if (req.query.id === undefined) {
			res.jsonp({'status':'error','error':'Invalid parameter error.'});
			return;
		} else {
			var textstore = new Textstore(db);
			textstore.markUnDeleted(sanitize(req.query.id).toLowerCase(), function(err) {
				if (err) {
					res.jsonp({'status':'error','error':err.message});
					return;
				} else {
					res.jsonp({'status':'success'});
					return;
				} 
			});
		}
	});
	
	app.get('/setsequence-api', function(req,res) {
		if ((req.query.id === undefined)||(req.query.sequence === undefined)||isNaN(req.query.sequence)) {
			res.jsonp({'status':'error','error':'Invalid parameter error.'});
			return;
		} else {
			var textstore = new Textstore(db);
			textstore.setSequence(sanitize(req.query.id).toLowerCase()
					           ,sanitize(req.query.sequence)
					           ,sanitize(req.query.series_name)
					           ,function(err) {
				if (err) {
					res.jsonp({'status':'error','error':err.message});
					return;
				} else {
					res.jsonp({'status':'success'});
					return;
				} 
			});
		}
	});
	
	app.get('/taglist', function(req,res) {
		var tags = new Tags(db);
		tags.getTagList(function (err, result) {
			if (err) {
				res.render('tags',{'error':err.message
								  ,'user':req.user
								  ,'config':config.site});
				return;
			} else {
				res.render('tags',{'taglist':result
								  ,'user':req.user
								  ,'config':config.site});
			}
		});
	});

	app.post('/serieslist', function(req,res) {
		var textstore = new Textstore(db);
		var page = 1;
		if (req.body.seriespage !== undefined) {
			page = sanitize(req.body.seriespage);
		}
		textstore.getSeriesList(page,
							  config.site.resultsPerPage,
				              function (err, result, count) {
			if (err) {
				res.render('serieslist',{'error':err.message
								  ,'user':req.user
								  ,'config':config.site});
				return;
			} else {
				res.render('serieslist',{'serieslist':result
								  ,'user':req.user
								  ,'config':config.site
								  ,'count':count
								  ,'page':page});
			}
		});
	});
	app.get('/serieslist', function(req,res) {
		var textstore = new Textstore(db);
		var page = 1;
		if (req.query.seriespage !== undefined) {
			page = sanitize(req.query.seriespage);
		}
		textstore.getSeriesList(page,
							  config.site.resultsPerPage,
	              			  function (err, result, count) {
			if (err) {
				res.render('serieslist',{'error':err.message
								  ,'user':req.user
								  ,'config':config.site});
				return;
			} else {
				res.render('serieslist',{'serieslist':result
								  ,'user':req.user
								  ,'config':config.site
								  ,'count':count
								  ,'page':page});
			}
		});
	});

	app.get('/savedocument-api', function(req,res) {
		if (req.query.id === undefined || req.query.textdata === undefined || req.query.textsummary === undefined) {
			res.jsonp({'status':'error','error':'Invalid parameter error: empty values.'});
			return;
		} else {
			var textstore = new Textstore(db);
			textstore.updateDocument(sanitize(req.query.id).toLowerCase(),
					 req.query.textdata,
					 req.query.textsummary,
					 function(err, result) {
				if (result.value) {
					if (result.value.current !== undefined) {
						result.value.current = striptags(result.value.current);
					}
				}
				if (err) {
					res.jsonp({'status':'error','error':err.message});
				    return;
			    } else {
			    	if (!result.value) {
			    		res.jsonp({'status':'error','error':'Error getting document from database: no document found'});
			    		return;
			    	}
			    	res.jsonp({'status':'success',
			    			   'title':result.value.title,
			    			   'summary':result.value.summary,
			    			   'body':result.value.current});
				    return;
			    }
			});
		}
	});
	
	app.get('/revertdocument-api', function(req,res) {
		if (req.query.id === undefined) {
			res.jsonp({'status':'error','error':'Invalid parameter error: empty id value.'});
			return;
		} else {
			var textstore = new Textstore(db);
			textstore.revertDocument(sanitize(req.query.id).toLowerCase(),
					 function(err, result) {
				if (result.value) {
					if (result.value.current !== undefined) {
						result.value.current = striptags(result.value.current);
					}
				}
				if (err) {
					res.jsonp({'status':'error','error':err.message});
				    return;
			    } else {
			    	if (!result.value) {
			    		res.jsonp({'status':'error','error':'Error getting document from database: no document found'});
			    		return;
			    	}
			    	res.jsonp({'status':'success',
			    			   'title':result.value.title,
			    			   'summary':result.value.summary,
			    			   'body':result.value.current});
				    return;
			    }
			});
		}
	});
};


function doSearch(query_params,req,res,db) {
	var textstore = new Textstore(db);
	var tags = null;
	
	if (query_params.tags !== undefined) {
		if (query_params.tags.length > 0) {
			tags = query_params.tags.split(" ");
		}
	}
	
	if (query_params.page === undefined) {
		query_params.page = 1;
	}
	textstore.covertInputToParams(tags, query_params.fulltext, function(params) {
		if (query_params.story !== undefined) {
			params["story.storyname"] = query_params.story;
			if (query_params.sortby === undefined) {
				query_params.sortby = "story";
			}
		}
		textstore.buildQueryOptions(query_params.page, query_params.fulltext, 
				                    query_params.sortby, function(sort_options, return_vals, 
				                    		                      skip, limit) {
			textstore.getSearchResults(params, sort_options, return_vals, skip, 
					                   limit, function(err, data, count, taglist) {
				if (err) {
					res.render('searchresults',{'error':err.message 
									 	,'images':{}
									 	,'user':req.user});
					return;
				} else {
					res.render('searchresults',{'searchresults':data
									 	,'user':req.user
									 	,'tags':query_params.tags
									 	,'fulltext':query_params.fulltext
									 	,'count':count
									 	,'page':query_params.page
									 	,'config':config.site
									 	,'sortby':query_params.sortby
									 	,'story':query_params.story
									 	,'taglist':taglist});
					return;
				}
			});
		});
	});
};

//input sanitization; this should cover the majority of user input fields
//the sanitizers are defined in /config/sanitizers.js
function sanitize(x, sanitizer) {
	if (sanitizer === undefined) {
		return validator.whitelist(x,sanitizers.standard);
	} else {
		return validator.whitelist(x,sanitizer);
	}
}

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

//route middleware to reject API calls if it doesn't find
//a login session for the requester
function isLoggedInAPI(req, res, next) {
	if (req.isAuthenticated())
		return next();
	
	res.jsonp({'status':'error','error':'Not logged in.'});
}