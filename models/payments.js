var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var base_path = process.env.PWD;

var entity = "payments";

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var _Schema = new Schema({
	  data : Object,
	  _user : { type : Schema.Types.ObjectId , ref : 'User'},
});

_Schema.pre('save', function (next) {
	if(this.data){
		this.data.hidden = false;
	}
	
  	next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 