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
      next(err);
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
        next(error);
    }

};