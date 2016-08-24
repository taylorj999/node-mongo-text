import os
from os.path import isfile, join
import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId
import datetime
import shutil
import argparse
import json

# load directory locations
jf = open("../config/directory.json")
dirs = json.load(jf);
input_dir = dirs['directories']['input_dir']
processed_dir = dirs['directories']['processed_dir']

# parse the command line arguments to see if there are
# any default tags specified
parser = argparse.ArgumentParser()
parser.add_argument('--dt',action='append')
parser.add_argument('--story',action='store')
args = parser.parse_args()
if args.dt != None:
	tags = args.dt
else:
	tags = []

client = MongoClient()
db = client.textstore
coll = db.textdata

onlyfiles = [ f for f in os.listdir(input_dir) if isfile(join(input_dir,f)) ]

for fName in onlyfiles:
	f = open(join(input_dir,fName), encoding="utf-8", errors="ignore")
	read_data = f.read()
	f.close()
	newdoc = {"original_date" : datetime.datetime.utcnow(),
			  "source" : fName,
			  "new" : True,
			  "title" : fName,
			  "current" : read_data,
			  "tags" : tags}
	if args.story != None:
		newdoc['story'] = {"storyname" : args.story}
	coll.insert(newdoc)
	shutil.move(join(input_dir,fName),join(processed_dir,fName))