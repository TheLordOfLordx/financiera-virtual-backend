module.exports = function(app, apiRoutes, io){
    var mongoose = require('mongoose');
    var multer  =   require('multer');
    var path = require("path");
    var model = require(path.join("../", "models", "resource.js"));
    var path = require("path");
    var crypto = require("crypto");
    var multerS3 = require('multer-s3');
    var aws = require("aws-sdk");
    var entity_name = "uploads";
    var cropper = require(path.join("../", "helpers", "cropper", "cropper.js"));


    aws.config.update({
        accessKeyId: "AKIAIBQ56J72L3L23YKQ",
        secretAccessKey: "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"
    });

    aws.config.update({region: 'us-west-2'});

    var s3 = new aws.S3();

    var upload = multer({
        storage: multerS3({
            s3: s3,
            acl: 'public-read',
            bucket: 'shoplyassets',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: function (req, file, cb) {
              cb(null, {fieldName: file.fieldname});
            },
            key: function (req, file, cb) {
                  crypto.pseudoRandomBytes(16, function (err, raw) {
                    if (err) return cb(err)
                    cb(null, raw.toString('hex') + path.extname(file.originalname));
                  });           
            }
        })
    }).single('file');

    function post(req, res, next){
        var data = {};
        data.data = req.file;
        var _data = new model(data);
        
        _data.save(function(err, saved){
            res.json(saved);
        });
    }

    function upload_amazon(req, res, next){
        cropper.uploadToS3(req.body.data, function(err, data){
            if (err) throw err;
            else       
                res.status(200).json(data);
        });
    }

    function upload_local(req, res, next){
        cropper.uploadToLocal(req.body.data, function(err, data){
            if (err) throw err;
            else       
                res.status(200).json(data);
        });
    }

    app.post("/api/" + entity_name , upload, post);
    app.post("/api/upload-amazon/", upload_amazon);
    app.post("/api/upload-local/", upload_local);

    return this;
}