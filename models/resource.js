
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var base_path = process.env.PWD;

var entity = "resource";

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var _Schema = new Schema({
	  data : Object
});

_Schema.pre('save', function (next) {
  next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 