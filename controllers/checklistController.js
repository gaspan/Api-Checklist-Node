const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Checklist = require("../models/checklistModel");
const Item = require("../models/itemModel");
const AppError = require("../utils/appError");
const APIFeatures = require('../utils/apiFeatures');

exports.create = async (req, res, next) => {
    try {
      let dataBody = req.body.data
      dataBody.attributes.created_by = req.user.id
      const checklist = await Checklist.create(dataBody.attributes);
  
      let id = checklist._id
      let attributes = checklist.toObject()
      delete attributes._id
      delete attributes.__v
      let fullURl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?') + '/' + id

      res.status(201).json({
        data: {
            type: "checklists",
            id: id,
            attributes : attributes,
            links: fullURl
        },
      });
    } catch (err) {
      res.status(500).json({
        "status": "500",
        "error": "Server Error"
      });
        
      // next(err);
    }
  };


exports.listListChecklist = async (req, res, next) => {
    try {
        let paramQuery = {}
        if(req.query.filter){
            paramQuery = JSON.parse(req.query.filter)
        }
        if(req.query.fields != "" && !(req.query.fields).includes('task_id') && req.query.include == "items" ){
            req.query.fields += ',task_id'
        }
        const features = new APIFeatures(Checklist.find(paramQuery), Checklist, req.query, req)
            .sort()
            .limitFields()
            .paginate()
            .paging();

        let doc = await features.query
        const count = await features.count
        const link = await features.links

        let data = []
        for(let i= 0; i < doc.length; i++){
            let fullURl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?')[0] + '/' + doc[i]._id
            let attributes = {}
            if(doc[i].object_domain !== undefined){
                attributes.object_domain = doc[i].object_domain
            }
            if(doc[i].object_id !== undefined){
                attributes.object_id = doc[i].object_id
            }
            if(doc[i].description !== undefined){
                attributes.description = doc[i].description
            }
            if(doc[i].is_completed !== undefined){
                attributes.is_completed = doc[i].is_completed
            }
            if(doc[i].due !== undefined){
                attributes.due = doc[i].due
            }
            if(doc[i].task_id !== undefined){
                attributes.task_id = doc[i].task_id
            }
            if(doc[i].urgency !== undefined){
                attributes.urgency = doc[i].urgency
            }
            if(doc[i].completed_at !== undefined){
                attributes.completed_at = doc[i].completed_at
            }
            if(doc[i].updated_by !== undefined){
                attributes.updated_by = doc[i].updated_by
            }
            if(doc[i].updated_at !== undefined){
                attributes.updated_at = doc[i].updated_at
            }
            if(doc[i].created_at !== undefined){
                attributes.created_at = doc[i].created_at
            }
            if(req.query.include == "items"){
                attributes.items = await Item.find({task_id: doc[i].task_id});
            }
            let item = {
                "type": "checklists",
                "id": doc[i]._id,
                "attributes": attributes,
                "links": {
                    "self": fullURl
                }
                    
            }
            data.push(item)

            if(i == ( doc.length - 1 ) ){
                res.status(200).json({
                    meta:{
                        count: doc.length,
                        total: count
                    },
                    links: link,
                    data: data
                });
            }
        }

    } catch (error) {
        res.status(500).json({
            "status": "500",
            "error": "Server Error"
          });

        // next(error);
    }

};

exports.getChecklist = async (req, res, next) => {
    try{
        const doc = await Checklist.findById(req.params.checklistId);

        if (!doc) {
            return next(new AppError(404, '404', 'Not Found'), req, res, next);
        }

        let id = doc._id
        let attributes = doc.toObject()
        delete attributes._id
        delete attributes.__v
        let fullURl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?')


        res.status(200).json({
            data: {
                type: "checklists",
                id: id,
                attributes: attributes,
                links: {
                    self: fullURl
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

exports.updateChecklist = async (req, res, next) => {
    try {
        const doc = await Checklist.findByIdAndUpdate(req.params.checklistId, req.body.data.attributes, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            return next(new AppError(404, '404', 'Not Found'), req, res, next);
        }

        let id = doc._id
        let attributes = doc.toObject()
        delete attributes._id
        delete attributes.__v
        let fullURl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?')

        res.status(200).json({
            data: {
                type: "checklists",
                id: id,
                attributes: attributes,
                links: {
                    self: fullURl
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

exports.deleteChecklist = async (req, res, next) => {
    try {
        const doc = await Checklist.findByIdAndDelete(req.params.checklistId);

        if (!doc) {
            return next(new AppError(404, '404', 'Not Found'), req, res, next);
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