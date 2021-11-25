const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Template = require("../models/templateModel");
const AppError = require("../utils/appError");
const APIFeatures = require('../utils/apiFeatures');

exports.create = async (req, res, next) => {
    try {
      let dataBody = req.body.data
      const template = await Template.create(dataBody.attributes);
  
      let id = template._id
      let attributes = template.toObject()
      delete attributes._id
      delete attributes.__v
      res.status(201).json({
        data: {
            id: id,
            attributes : attributes
        },
      });
    } catch (err) {
        res.status(500).json({
            "status": "500",
            "error": "Server Error"
          });
    //   next(err);
    }
  };


exports.listAllChecklistTemplate = async (req, res, next) => {
    try {
        let paramQuery = {}
        if(req.query.filter){
            paramQuery = JSON.parse(req.query.filter)
        }
        const features = new APIFeatures(Template.find(paramQuery), Template, req.query, req)
            .sort()
            .limitFields()
            .paginate()
            .paging();

        const doc = await features.query
        const count = await features.count
        const link = await features.links

        res.status(200).json({
            meta:{
                count: doc.length,
                total: count
            },
            links: link,
            data: doc
        });

    } catch (error) {
        res.status(500).json({
            "status": "500",
            "error": "Server Error"
          });
        // next(error);
    }

};

exports.getTemplate = async (req, res, next) => {
    try{
        const doc = await Template.findById(req.params.templateId);

        if (!doc) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        }

        let id = doc._id
        let attributes = doc.toObject()
        delete attributes._id
        delete attributes.__v
        let fullURl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?')


        res.status(200).json({
            data: {
                type: "templates",
                id: id,
                attributes: attributes,
                links: {
                    self:fullURl
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            "status": "500",
            "error": "Server Error"
          });
        // next(error);
    }
};

exports.updateTemplate = async (req, res, next) => {
    try {
        const doc = await Template.findByIdAndUpdate(req.params.templateId, req.body.data, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        }

        let id = doc._id
        let attributes = doc.toObject()
        delete attributes._id
        delete attributes.__v
        let fullURl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?')

        res.status(200).json({
            data: {
                type: "templates",
                id: id,
                attributes: attributes,
                links: {
                    self:fullURl
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            "status": "500",
            "error": "Server Error"
          });
        // next(error);
    }
};

exports.deleteTemplate = async (req, res, next) => {
    try {
        const doc = await Template.findByIdAndDelete(req.params.templateId);

        if (!doc) {
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        }

        res.status(204).json({
            response: 'The 204 response.'
        });
    } catch (error) {
        res.status(500).json({
            "status": "500",
            "error": "Server Error"
          });
        // next(error);
    }
};