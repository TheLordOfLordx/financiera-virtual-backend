module.exports = function(app, apiRoutes, io){
		var _entity ="payments";
		var _url_alias = "payments";
		var path = require("path");
		var mongoose = require('mongoose');
		var Model = require(path.join("../", "models", _entity + ".js"));
	    var _compiler = require(path.join(process.env.PWD , "helpers", "mailer.js"));

	    var api_key = process.env.MAILGUN_API_KEY || null;;
	    var domain = 'daimont.com';
	    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

		function get(req, res){
			var REQ = req.params; 
			var where;

			if(req.headers['x-daimont-user']){
				where = { "metadata._author" :  mongoose.Types.ObjectId.isValid(req.headers['x-daimont-user']) ? mongoose.Types.ObjectId(req.headers['x-daimont-user']) :req.headers['x-daimont-user'] , "data.hidden" : false};
			}

			 Model.find( where || {} ).populate("_user").exec(function(err, rs){
					if(!err){
						res.status(200).json(rs);
					}else{
						res.json(err);
					}
			 });
		}



		function getById(req, res){
			var REQ = req.params; 
			var where;

			if(req.headers['x-daimont-user']){
				where = { "metadata._author" : req.headers['x-daimont-user'] };
			}

			where._id = mongoose.Types.ObjectId(REQ.user);

			Model.findOne(where || {}).exec(function(err, rs){
				if(!err){
					res.status(200).json(rs);
				}else{
					res.status(500).json(err);
				}
			});
		}

		function post(req, res){
			var data = {};
			var REQ = req.body || req.params;
  			!REQ.metadata || (data.metadata = REQ.metadata);
			!REQ.data || (data.data = REQ.data);

			data.metadata = data.metadata || {};
			data.metadata._author = mongoose.Types.ObjectId(req.headers['x-daimont-user']);

			var model = new Model(data);
			
			model.save(function(err, credit){
				if(credit){
			    	res.status(200).json(credit);
				}else{
					res.status(500).json(err);
				}
			});
		}


		function update(req, res){
			var data = {};
			var REQ = req.body || req.params;
			var where = {};

			if(req.headers['x-daimont-user']){
				where = { "metadata._author" : req.headers['x-daimont-user'] };
			}

			where._id = mongoose.Types.ObjectId(req.params.id);

			!REQ.data || (data.data = REQ.data); 

			data = { $set : data };          

			Model.update( where , data , function(err, rs){
				if(rs){
					res.status(200).json(rs);
				}else{
					res.status(500).json(err)
				}
			});
		}


		function remove(req, res){
			var where = {} ;

			if(req.headers['x-daimont-user']){
				where = { "metadata.author" : req.headers['x-daimont-user'] };
			}

			where._id = mongoose.Types.ObjectId(req.params.id);

			Model.remove( where , function(err, rs){
				if(!err){
						res.status(200).json(rs);
				}else{
					 res.status(500).json(err);
				}
			});
		 }

		apiRoutes.get("/" + _url_alias , get);
		apiRoutes.get("/" + _url_alias + "/:id", getById);
		apiRoutes.post("/" + _url_alias, post);
		apiRoutes.put("/" + _url_alias + "/:id", update);
		apiRoutes.delete("/" + _url_alias + "/:id", remove);

		return this;
}