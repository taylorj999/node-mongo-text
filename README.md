NodeJS Text Datastore
=====================

This is a Node.JS application for MongoDB that stores text documents and allows basic tagging, 
tag search and text search. It was mainly intended as an experiment with text indexing, 
dealing with horribly formatted documents, and trying to keep users from sneaking HTML into
every available nook and cranny. It uses Express as a lightweight front end web server. 

## Requirements

Requires a mongodb installation. Due to the use of text indexes, MongoDB v3.2 or later is 
required. The application was tested against [MongoDB v3.2](https://www.mongodb.com/download-center). 

---

## Features
- Document tagging and search by tags
- Full text search of stored documents
- python script for mass-loading documents from an upload directory

---

## App Setup
Clone this repository and then run `npm install` to retrieve all the dependencies.

Modify config files if needed:
### config.js
- `config.system.mongoConnectString` is the location of the mongodb you are running against
- `config.system.sessionKey` is the session secret key, change this to a unique value
- `config.system.serverPort` is the port the application will listen on, default is 3001
- `config.site.resultsPerPage` is the number of results to display on search summary pages

### directory.json
This file contains the directory locations for the python-textloader. An input directory of files
to process, and a directory to move processed files to. Change to relevant locations on your
system if you want to use the python imageloader

---

## Database Setup
By default the application uses the database name `textstore`, this can be changed in the config
files above. While connected to the database you intend to use, you can create the two indexes
required for the application as listed below:

- `db.textdata.createIndex({'title':'text','summary':'text','current':'text'},{'name':'textIndex'});`
- `db.textdata.createIndex({'tags':1},{'name':'tagsIndex'});`

The text index must be created in order for the full text search to work.

---

## Uses:
- https://github.com/lazygyu/RTF-parser
