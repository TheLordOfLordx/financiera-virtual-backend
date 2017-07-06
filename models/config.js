
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');



var _Schema = new Schema({
	  business_name : { type : String, trim : true, required: true},
	  location : { type : String, trim : true, required: true}
});


_Schema.pre('save', function (next) {
  
 // do stuff

  next();
  
});


//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);


module.exports = mongoose.model('Config', _Schema); 