var crypto = require('crypto');

var base_path = process.env.PWD;

var config = require(base_path + '/config.js');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;


// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var _Schema = new Schema({
	  username : { type : String, trim : true, lowercase : true},
	  password : {type: String, required : false},
	  name : { type : String, trim : true,  lowercase : true},
	  last_name : { type : String, trim : true, lowercase : true},
	  full_name : { type : String, trim : true, lowercase : true},
	  email : { type : String, trim : true , unique : true, lowercase:true},
	  data:{ type : Object},
	  active : { type : Boolean, default : true},
	  type : { type : String, trim : true, default : 'ADMINISTRATOR'},
	  _role : [{ type : Schema.Types.ObjectId , ref : 'Role'}],
	  _permission :{ type : Schema.Types.ObjectId , ref : 'permission'},
	  _company : { type : Schema.Types.ObjectId , ref : 'company'},
	  _grocery : [{ type : Schema.Types.ObjectId , ref : 'grocery'}],
	  _route :  [{ type : Schema.Types.ObjectId , ref : 'route'}],
	  resetPasswordToken: String,
  	  resetPasswordExpires: Date,
  	  verificationCode : String
});

_Schema.pre('save', function (next) {
    this.full_name = (this.name || '') + ' ' + (this.last_name  || '');
    next();
});

_Schema.methods.auth = function(password, callback){
    var res = true;
	if(require('../helpers/crypto-util')(password) !== this.password){
	     res = false;
	}
	
    if(callback)
     	callback(res);
    else
        return res;
}

_Schema.statics.exists = function(email, callback){
	this.find({ email : email}, function(err, rs){
        callback(err, rs.length);
	})
}

_Schema.static

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model('User', _Schema);


