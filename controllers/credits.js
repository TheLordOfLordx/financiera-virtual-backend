module.exports = function(app, apiRoutes, io){
		var _entity ="credits";
		var _url_alias = "credits";

		var path = require("path");
		var mongoose = require('mongoose');
		var Model = require(path.join("../", "models", _entity + ".js"));
	    
	    var _compiler = require(path.join(process.env.PWD , "helpers", "mailer.js"));
	    var api_key = 'key-7060b4df5bc7256cbdbe3f0f4933414a';
	    var domain = 'daimont.com';
	    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

		function get(req, res){
			var REQ = req.params; 
			var where;

			if(req.headers['x-daimont-user']){
				where = { "metadata._author" : req.headers['x-daimont-user'], "data.hidden" : false};
			}

			 Model.find( where || {} ).exec(function(err, rs){
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

			var model = new Model(data);

			model.save(function(err, rs){
				if(rs){
		              var _html = _compiler.render({ _data : {
		              	  user : rs.first_name,
		                  amount : rs.data.amount[0],
		                  interestsDays : rs.data.interestsDays,
		                  pay_day : rs.data.pay_day,
		                  system_quoteDays : rs.data.system_quoteDays,
		                  finance_quote : rs.data.finance_quote,
		                  ivaDays : rs.data.ivaDays,
		                  total_payment : rs.data.total_payment
		               }}, 'credit_resume/index.ejs');

		              var data = {
		                from: ' Daimont <noreply@daimont.com>',
		                to: user.email,
		                subject: 'Resumen de credito',
		                text: 'Detalle y estado de su credito actual',
		                html: _html
		              };

		              mailgun.messages().send(data, function (error, body) {
		                console.log(body);
		              });

					  res.status(200).json(rs);
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