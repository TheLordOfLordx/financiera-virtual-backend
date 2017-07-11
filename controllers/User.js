module.exports = function(app, apiRoutes){
    var mongoose = require('mongoose');
    var user_manager = require('../models/user_manager');
    var path = require("path");
    var User = require('../models/user');
    var crypto = require("crypto");
    var _compiler = require(path.join(process.env.PWD , "helpers", "mailer.js"));

    var api_key = 'key-7060b4df5bc7256cbdbe3f0f4933414a';
    var domain = 'daimont.com';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});


    function create(req, res){
       var data = req.body;
       var password_text = req.body.password;

        user_manager.create(data, function(err, user){
          
          if(err){
              res.status(409).json({code : 11000});
              return;
          }

          if(user){

          var data = {
            from: ' <noreply@daimont.com>',
            to: 'listerine1989@gmail.com',
            subject: 'Hello',
            text: 'Hola como estas?'
          };

          mailgun.messages().send(data, function (error, body) {
            console.log(body);
          });
              
              /*var _html = _compiler.render({ _data : {
                  name : usuario.name,
                  last_name : usuario.last_name,
                  email : usuario.email
               }}, 'activation/index.ejs');*/

              res.status(200).json(user);

          }

        });
    }

    function update(req, res){
         var data = {};
         var REQ = req.body || req.params;
         !REQ.metadata || (data.metadata = REQ.metadata);
         !REQ.data || (data.data = REQ.data);
         !REQ.username || (data.username = REQ.username);
         !REQ.password || (data.password = REQ.password);
         !REQ.email || (data.email = REQ.email);
         !REQ.name || (data.name = REQ.name);
         !REQ.last_name || (data.last_name = REQ.last_name);

          if(REQ.password){
            data.password = require(process.env.PWD + "/helpers/crypto-util")(REQ.password);
          } 

          data = { $set : data }; 

          user_manager.update({ _id : mongoose.Types.ObjectId(req.params.id) }, data, function(err, rs){
              if(rs){
                  res.json(rs);
              }
          });   
    }

    function remove(req, res){
        user_manager.remove(req.params.id, function(err, user){
            if(!err){
                user.remove();
                res.status(200)
                res.end();
            }
        })
    }

    function users(req, res){
        User.find().exec(function(err, users){
            if(!err){
                res.send(users);
            }
        });
    }

    function user(req, res){
        User
        .findOne( mongoose.Types.ObjectId(req.params.id))
        .exec(function(err, rs){
            if(rs)
                res.json(rs);
            else
                res.json(err);
        })

    }

    function login(req, res){
            if (!req.body.email) {
                res.status(400).send({err : 'debe especificar un usuario'});
                return;
            }

            if (!req.body.password) {
                res.status(400).send({err : 'debe especificar un password'});
                return;
            }

          var jwt = require('jsonwebtoken');
          var UserSchema = require('../models/user');

         UserSchema.findOne({ email : req.body.email }).exec(function(err, user){
            if(!user){
                    res.status(401).json({err : 'Usuario o clave incorrectos'});
                    return;
             }

            if(user.auth(req.body.password)){
                  user.password = null;

                  var token = jwt.sign(user, app.get('secret'), {
                      expiresIn: 43200 // 24 horas (suficientes para una jornada laboral)
                    });

                  user_manager.createSession({token : token, user : user }, function(err, userToken){
                        res.status(200).json({token:token, user : user});
                  });  
            }else{
                  res.status(401).json({err: 'Usuario o clave incorrectos'});
            }
        });
    }

    function exists(req, res){
        User.exists(req.params.email.toLowerCase(), function(err, rs){
           rs = rs === 0 ? -1 : rs;

           res.status(200).json({ exists : rs});
        }) 
    }

    function passwordReset(req, res){
         var data = {};
         var REQ = req.body || req.params;

        if(REQ.newpwd == REQ.confirmpwd){
            User.findOne({ _id : mongoose.Types.ObjectId(REQ.id) }, function(err, rs){
                if(rs){
                        rs.password = require(process.env.PWD + "/helpers/crypto-util")(REQ.newpwd);
                        rs.save(function(err, rs){
                            if(rs){
                                res.status(200).json({message : "ok"});
                            }
                        })
                }else{
                    res.status(404).json({message : "user not found"})
                }
            });            
        }else{
            res.status(400).json({message : "password not match"})
        }
    }

    function recover(req, res){
        var REQ = req.body || req.params;
        User.findOne({ email : REQ.email}, function(err, rs){
            if(rs){
                  crypto.pseudoRandomBytes(30, function (err, raw) {
                      rs.resetPasswordToken = raw.toString('hex');
                      rs.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                      rs.save(function(err, rs){
                          if(rs){
                              res.status(200).json({message : "ok"});

                              var _html;
                              var mailOptions = {
                                    from: "listerine1989@gmail.com",
                                    to: rs.email,
                                    subject: 'Recuperacion de Contraseña'
                              }

                              _html = _compiler.render({ _data : {
                                url : rs.resetPasswordToken
                                } }, 'recover/index.ejs');

                               mailOptions.html = _html;

                              var _shell  = _batmanMailer.bulk([mailOptions]);

                              _shell.stdout.on('data', function(output) {
                                  console.log('stdout: ' + output);
                              });

                              _shell.stderr.on('data', function(output) {
                                  console.log('stdout: ' + output);
                              });

                              _shell.on('close', function(code) {
                                  console.log('closing code: ' + code);
                              }); 
                          }
                          })
                      }) 
                  }else{
                      res.status(404).json({message : "user not found"})
                  }                    
                  
                  }); 
    }

  function reset(req, res){
      var REQ = req.body || req.params;
      
      User.findOne({ resetPasswordToken: REQ.link, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            res.status(404).json({message: 'no user found or reset link has been expired'});
        }else{
          user.password = require(process.env.PWD + "/helpers/crypto-util")(REQ.newpwd);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err, rs){
              if(rs){
                  res.status(200).json({message : "ok"});
              }
          })
        }
      });      
  }

    apiRoutes.get('/user', users);
    apiRoutes.get('/user/:id', user);
    app.get('/api/user/exists/:email', exists);
    app.post('/api/reset/:token', reset);
    app.post('/api/password-reset/', passwordReset);
    app.post('/api/recover/', recover);
    app.post("/api/user", create);
    app.post("/api/login", login);
    apiRoutes.put("/user/:id", update);
    apiRoutes.delete("/user/:id", remove);

    return this;
}