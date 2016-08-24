/// This class is a interface for each converters. ( e.g. 2PlainText, 2HTML, ... etc )
function RtfConverter(){
	
}

var KWD = {
	"char":0
	,"dest":1
	,"prop":2
    ,"spec":3
}


// Keyword descriptions
var rgsymRtf = {
						 //  keyword     dflt    fPassDflt   kwd         idx
	"b"					 : [ "b",        1,      false,     KWD.prop,    "propBold"],
	"ul"				 : [ "ul",       1,      false,     KWD.prop,    "propUnderline"],
	"i"					 : [ "i",        1,      false,     KWD.prop,    "propItalic"],
	"li"				 : [ "li",       0,      false,     KWD.prop,      "propPgnFormat"],
	"pgnucltr"			 : [ "pgnucltr", "pgULtr", true,      KWD.prop,    "propPgnFormat"],
	"pgnlcltr"			 : [ "pgnlcltr", "pgLLtr", true,      KWD.prop,    "propPgnFormat"],
	"qc"				 : [ "qc",       "justC",  true,      KWD.prop,    "propJust"],
	"ql"				 : [ "ql",       "justL",  true,      KWD.prop,    "propJust"],
	"qr"				 : [ "qr",       "justR",  true,      KWD.prop,    "propJust"],
	"qj"				 : [ "qj",       "justF",  true,      KWD.prop,    "propJust"],
	"paperw"			 : [ "paperw",   12240,  false,     KWD.prop,    "propXaPage"],
	"paperh"			 : [ "paperh",   15480,  false,     KWD.prop,    "propYaPage"],
	"margl"				 : [ "margl",    1800,   false,     KWD.prop,    "propXaLeft"],
	"margr"				 : [ "margr",    1800,   false,     KWD.prop,    "propXaRight"],
	"margt"				 : [ "margt",    1440,   false,     KWD.prop,    "propYaTop"],
	"margb"				 : [ "margb",    1440,   false,     KWD.prop,    "propYaBottom"],
	"pgnstart"			 : [ "pgnstart", 1,      true,      KWD.prop,    "propPgnStart"],
	"facingp"			 : [ "facingp",  1,      true,      KWD.prop,    "propFacingp"],
	"landscape"			 : [ "landscape",1,      true,      KWD.prop,    "propLandscape"],
	"par"				 : [ "par",      0,      false,     KWD.char,    "\n"],
	"pard"				 : [ "pard",	 0,		 false,		KWD.prop,	 "propDefaultPara"],
	"\0x0a"				 : [ "\0x0a",    0,      false,     KWD.char,    "\n"],
	"\0x0d"				 : [ "\0x0d",    0,      false,     KWD.char,    ""],
	"tab"				 : [ "tab",      0,      false,     KWD.char,    "\t"],
	"ldblquote"			 : [ "ldblquote",0,      false,     KWD.char,    '"'],
	"rdblquote"			 : [ "rdblquote",0,      false,     KWD.char,    '"'],
	"bin"				 : [ "bin",      0,      false,     KWD.spec,    "ipfnBin"],
	"*"					 : [ "*",        0,      false,     KWD.spec,    "ipfnDestSkip"],
	"'"					 : [ "'",        0,      false,     KWD.spec,    "ipfnHex"],
	"author"			 : [ "author",   0,      false,     KWD.dest,    "destSkip"],
	"buptim"			 : [ "buptim",   0,      false,     KWD.dest,    "destSkip"],
	"colortbl"			 : [ "colortbl", 0,      false,     KWD.dest,    "destSkip"],
	"comment"			 : [ "comment",  0,      false,     KWD.dest,    "destSkip"],
	"creatim"			 : [ "creatim",  0,      false,     KWD.dest,    "destSkip"],
	"doccomm"			 : [ "doccomm",  0,      false,     KWD.dest,    "destSkip"],
	"fonttbl"			 : [ "fonttbl",  0,      false,     KWD.dest,    "destSkip"],
	"footer"			 : [ "footer",   0,      false,     KWD.dest,    "destSkip"],
	"footerf"			 : [ "footerf",  0,      false,     KWD.dest,    "destSkip"],
	"footerl"			 : [ "footerl",  0,      false,     KWD.dest,    "destSkip"],
	"footerr"			 : [ "footerr",  0,      false,     KWD.dest,    "destSkip"],
	"footnote"			 : [ "footnote", 0,      false,     KWD.dest,    "destSkip"],
	"ftncn"				 : [ "ftncn",    0,      false,     KWD.dest,    "destSkip"],
	"ftnsep"			 : [ "ftnsep",   0,      false,     KWD.dest,    "destSkip"],
	"ftnsepc"			 : [ "ftnsepc",  0,      false,     KWD.dest,    "destSkip"],
	"fprq"				 : [ "fprq",	 0,		 false,		KWD.dest,	 "destSkip"],
	"fcharset"			 : [ "fcharset", 0,		 false,		KWD.dest,	 "destSkip"],
	"rquote"			 : [ "rquote",	 0,		 false,		KWD.char,	 "'"],
//	"s"					 : [ "s",		 0,		 false,		KWD.dest,	 "destSkip"],
	"header"			 : [ "header",   0,      false,     KWD.dest,    "destSkip"],
	"headerf"			 : [ "headerf",  0,      false,     KWD.dest,    "destSkip"],
	"headerl"			 : [ "headerl",  0,      false,     KWD.dest,    "destSkip"],
	"headerr"			 : [ "headerr",  0,      false,     KWD.dest,    "destSkip"],
	"info"				 : [ "info",     0,      false,     KWD.dest,    "destSkip"],
	"keywords"			 : [ "keywords", 0,      false,     KWD.dest,    "destSkip"],
	"operator"			 : [ "operator", 0,      false,     KWD.dest,    "destSkip"],
	"pict"				 : [ "pict",     0,      false,     KWD.dest,    "destSkip"],
	"printim"			 : [ "printim",  0,      false,     KWD.dest,    "destSkip"],
	"private1"			 : [ "private1", 0,      false,     KWD.dest,    "destSkip"],
	"revtim"			 : [ "revtim",   0,      false,     KWD.dest,    "destSkip"],
	"rxe"				 : [ "rxe",      0,      false,     KWD.dest,    "destSkip"],
	"stylesheet"		 : [ "stylesheet",   0,      false,     KWD.dest,    "destSkip"],
	"subject"			 : [ "subject",  0,      false,     KWD.dest,    "destSkip"],
	"tc"		 	 	 : [ "tc",       0,      false,     KWD.dest,    "destSkip"],
	"title"				 : [ "title",    0,      false,     KWD.dest,    "destSkip"],
	"txe"				 : [ "txe",      0,      false,     KWD.dest,    "destSkip"],
	"xe"				 : [ "xe",       0,      false,     KWD.dest,    "destSkip"],
	"["					 : [ "[",        0,      false,     KWD.char,    '['],
	"]"					 : [ "]",        0,      false,     KWD.char,    ']'],
	"\\"				 : [ "\\",       0,      false,     KWD.char,    '\\']
}

/// A prototype converter below; rtf2plain text
// This class is just a practice......T_T
function TextConverter(){
	this.codePage = "";
	this.paper = {"width":0, "height":0}
	var _rtf;
	var curState = 0;		// 0 = normal, 1 = skip
	var states = [];
	var cur = 0;
	var hexreturn = false;

	var that = this;

	var checkChar = function(sym, ch){
		switch(curState){
			case 0:
				if(sym && sym[4]){
					return sym[4];
				}
			case 1:
				console.log("skipped : " + sym[4]);
				return '';
			default:
				if(sym && sym[4]){
					return sym[4];
				}
		}
	}

	var pushState = function(){
		states.push["group"];
		return true;
	}

	var popState = function(){
		states.pop();
		if(curState > 0) curState--;
		return true;
	}

	var parseSpec = function(sym, v){
		var ch = '';
		switch(sym[4]){
			case "ipfnDestSkip":
				
				curState ++;
				return '';
				break;
			case "ipfnHex":

				ch = _rtf.charAt(++cur);
				var hex = '';
				while(/[a-fA-F0-9\']/.test(ch)){
					if(ch == "'"){
						cur++;
						continue;
					}
					hex += (ch + '');
					ch = _rtf.charAt(++cur);
				}
				//ch = parseInt(ch, 16);
				console.log("hex : " + hex);
				hexreturn = true;
				cur--;
				if( curState !== 0 ) return '';
				else return hex;
				break;
			case "codePage":
				ch = _rtf.charAt(++cur);
				var code = '';
				while(/[0-9]/.test(ch)){
					code += (ch + '');
					ch = _rtf.charAt(++cur);
				}
				that.codePage=code;
				cur--;
				return '';
				break;
		}
		return '';
	}

	var applyPropChange = function(sym, param){
		console.log("prop : " + sym[0] + " / param : " + param);
		var tags = {
			
		}
		if(tags[sym[0]]){
			if(param === 0){
				var tmp = tags[sym[0]].split(' ')[0];
				return "</" + tmp + ">";
			}else{
				var tmp = tags[sym[0]];
				return "<" + tmp + ">";
			}
		}else{
			switch(sym[0]){
				case "paperw":
					that.paper.width = param;
					break;
				case "paperh":
					that.paper.height = param;
					break;
			}
		}
		
		return '';
	}


	var changeDest = function(sym){
		if(sym[4] == "destSkip"){
			console.log("Dest skip start : [" + sym[0] + "]");
			curState ++;

		}
		return '';
	}

	var translateKeyword = function(keyword, param, fParam){
		if( rgsymRtf[keyword] !== undefined ){
			var sym = rgsymRtf[keyword];
			switch(sym[3]){
				case KWD.prop:
					if( sym[2]  || !fParam ){
						param = sym[1];
					}
					return applyPropChange(sym, param);
					break;
				case KWD.char:
					return checkChar(sym, param);
					break;
				case KWD.dest:
					return changeDest(sym);
					break;
				case KWD.spec:
					return parseSpec(sym, param);
					break;
				default:
					return '';
					break;
			}
		}else{
			console.log("skip : " + keyword);
			if(states.length > 0) curState = 1;
			return '';
		}
	}

	var parseKeyword = function(rtf, len){
		var ch = '';
		var fParam = false, fNeg = false;
		var keyword = '';
		var param = '';
		_rtf = rtf;
		if( ++cur >= len ) return len;
		ch = rtf.charAt(cur);
		if( ! /[a-zA-Z]/.test(ch) ){
			return translateKeyword(ch, null, fParam);
		}

		while(/[a-zA-Z]/.test(ch)){
			keyword += ch;
			ch = rtf.charAt(++cur);
		}
		
		if( ch == '-' ){
			fNeg = true;
			ch = rtf.charAt(++cur);
		}
		fParam = true;
		while( /[0-9]/.test(ch) ){
			param += (ch + '');
			ch = rtf.charAt(++cur);
		}
		cur--;
		param = parseInt(param);
		if( fNeg )
			param *= -1;
		
		return translateKeyword(keyword, param, fParam);
	}

	this.convert = function(rtf){
		if(rtf.length == 0){
			alert("invalid rtf");
			return '';
		}
		cur = -1;
		var len = rtf.length;
		var tmp = '';
		var res = '';
		var ch = '';
		var hex = '';
		var lastchar = 0;
		while(cur < len){
			tmp = rtf.charAt(++cur);
			if(tmp !== "\\" && hex.length > 0){
				res += String.fromCharCode(parseInt((hex), 16));
				hex = '';
			}
			switch(tmp){
				case " ":
					if(lastchar == 1){
						lastchar = 0;
					}else{
						res += tmp;
					}
					break;
				case "{":
					if(pushState() == true){
						console.log("push");
					}
					break;
				case "}":
					if(popState() == true){
						console.log("pop");
					}
					break;
				case "\\":
					ch = parseKeyword(rtf, len);
					if( !hexreturn && ch.length == 0){
						lastchar = 1;
					}else{
						lastchar = 0;
					}
					if( hexreturn ){
						if(ch.length > 0){
							if(parseInt(ch, 16) & 0x80){
								hex += ch.toUpperCase();
							}else{
								res += String.fromCharCode(parseInt((hex + ch), 16));
								hex = '';
							}
							if(hex.length == 4){
								var temp = parseInt(hex, 16);
								if(hexTable && hexTable[hex.toUpperCase()] !== undefined){
									temp = parseInt(hexTable[hex.toUpperCase()], 16);
								}
								res += String.fromCharCode(temp);
								hex = '';
							}
						}else{
							console.log("hex skipped");
						}
						hexreturn = false;
					}else if( ch !== undefined && curState === 0)
						res += ch;
					break;
				case 0x0d:
				case 0x0a:
				case '\n':
				case '\r':
					break;
				default:
					lastchar = 0;
					if( curState == 0 ){
						res += tmp;
					}else{
						//do nothing
						
					}
					break;
			}
		}
		return res;
	}
}
TextConverter.prototype = new RtfConverter();