module.exports = function(app, apiRoutes, io){
  	var _entity ="credits";
  	var _url_alias = "credits";

  	var path = require("path");
    var mongoose = require('mongoose');
    var Model = require(path.join("../", "models", _entity + ".js"));

    function get(req, res){
      var REQ = req.params; 

       Model.find({ _user :  mongoose.Types.ObjectId(REQ.user) }).exec(function(err, rs){
           if(!err){
              res.status(200).json(rs);
           }else{
              res.json(err);
           }
       });
    }



    function getById(req, res){

      var REQ = req.params; 

       Model.findOne({ _id : REQ.id , _user :  mongoose.Types.ObjectId(REQ.user) }).exec(function(err, rs){
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

      !REQ.data || (data.data = REQ.data);

      var model = new Model(data);

  		model.save(function(err, rs){
    			if(rs){
    				res.status(200).json(rs);
    			}else{
    				res.status(500).json(err);
    			}
  		});
    }


    function update(req, res){
  		var data = {};
  		var REQ = req.body || req.params;

  		!REQ.data || (data.data = REQ.data); 

  		data = { $set : data };          

  		Model.update({ _id : mongoose.Types.ObjectId(req.params.id), _user :  mongoose.Types.ObjectId(REQ.user)  }, data, function(err, rs){
  			if(rs){
  				res.status(200).json(rs);
  			}else{
          res.status(500).json(err)
        }
  		});
    }


    function remove(req, res){
        Model.remove({ _id : mongoose.Types.ObjectId(req.params.id) , _user :  mongoose.Types.ObjectId(REQ.user) }, function(err, rs){
              if(!err){
                  res.status(200).json(rs);
              }else{
                 res.status(500).json(err);
              }
        });
	   }

    apiRoutes.get("/" + _url_alias + "/:user", get);
    apiRoutes.get("/" + _url_alias + "/user:/:id", getById);
    apiRoutes.post("/" + _url_alias, post);
    apiRoutes.put("/" + _url_alias + "/:user/:id", update);
    apiRoutes.delete("/" + _url_alias + "/:user/:id", remove);

    return this;
}