const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Item = require("../models/itemModel");
const Checklist = require("../models/checklistModel");
const AppError = require("../utils/appError");
const APIFeatures = require('../utils/apiFeatures');

exports.create = async (req, res, next) => {
    try {
      let dataBody = req.body.data
      dataBody.attribute.created_by = req.user.id
      const item = await Item.create(dataBody.attribute);
  
      let id = item._id
      let attributes = item.toObject()
      delete attributes._id
      delete attributes.__v
      let fullURl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?') + '/' + id

      res.status(201).json({
        data: {
            id: id,
            type: "checklists",
            attributes : attributes,
            links:{
                self: fullURl
            }
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


exports.listAllItemChecklist = async (req, res, next) => {
    try {

        let doc = await Checklist.findById(req.params.checklistId);

        if (!doc) {
            return next(new AppError(404, '404', 'Not Found'), req, res, next);
        }
        doc = doc.toObject()
        let id = doc._id
        let attributes = doc
        delete attributes._id
        delete attributes.__v
        
        let paramQuery = ""
        if(req.query.filter){
            paramQuery = JSON.parse(req.query.filter)
        }

        let query
        let project = {
            $project: {
                id: "$_id",
                name: 1,
                is_completed: 1 ,
                due: 1, 
                urgency: 1, 
                assignee_id: 1, 
                task_id: 1, 
                completed_at: 1,
                last_update_by: 1,
                update_at: 1, 
                created_at: 1,
                checklist_id :{ $literal: req.params.checklistId },
                user_id: "$created_by"
            }
        }
        if (paramQuery == "") {
            query = {
                $match: {task_id : doc.task_id}
            }
        } else {
            query = {
                $match: {
                    $and :[
                        {task_id : doc.task_id },
                        paramQuery       
                    ]
                }
            }
        }

        let document = await Item.aggregate([query, project]);

        res.status(200).json({
            
            data: {
                type: 'checklists',
                id: id,
                attributes : document
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

exports.getItem = async (req, res, next) => {
    try{
        const doc = await Item.findById(req.params.itemId);

        if (!doc) {
            return next(new AppError(404, '404', 'No document found with that id'), req, res, next);
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

exports.updateItem = async (req, res, next) => {
    try {
        const doc = await Item.findByIdAndUpdate(req.params.itemId, req.body.data.attribute, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            return next(new AppError(404, '404', 'No document found with that id'), req, res, next);
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

exports.deleteItem = async (req, res, next) => {
    try {
        const doc = await Item.findByIdAndDelete(req.params.itemId);

        if (!doc) {
            return next(new AppError(404, '404', 'No document found with that id'), req, res, next);
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

exports.updateBulkChecklist = async (req, res, next) => {
    try {
        let data = req.body.data
        let item_res = [] 
        for(let x = 0; x < data.length; x++ ){

            const doc = await Checklist.findByIdAndUpdate(data[x].id, data[x].attributes, {
                new: true,
                runValidators: true
            });
            
            let status
            if (!doc) {
                status = '404'
            } else {
                status = '200'
            }

            let item = {
                id : data[x].id,
                action : data[x].action,
                status : status
            }
            item_res.push(item)

            if(x == (data.length - 1) ){

                res.status(200).json({
                    data: item_res
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

exports.sumaryItem = async (req, res, next) => {
    try {
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let dateTimeToday = date+'T00:00:00.0Z'
        let dateTimeTodayend = date+'T23:59:59.0Z'
        const doc_today = await Item.aggregate([{
            $match: { 
                completed_at: {
                    $gte: new Date(dateTimeToday), $lt: new Date(dateTimeTodayend)
                }
            }
        }]);

        let datePastDue = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-1);
        let dateTimePastDue = datePastDue+'T00:00:00.0Z'
        let dateTimePastDueend = datePastDue+'T23:59:59.0Z'
        const docPastDue = await Item.aggregate([{
            $match: { 
                completed_at: {
                    $gte: new Date(dateTimePastDue), $lt: new Date(dateTimePastDueend)
                }
            }
        }]);

        let dateThisWeek = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-7);
        let dateTimeThisWeek = dateThisWeek+'T00:00:00.0Z'
        let dateTimeThisWeekend = date+'T23:59:59.0Z'
        const docThisWeek = await Item.aggregate([{
            $match: { 
                completed_at: {
                    $gte: new Date(dateTimeThisWeek), $lt: new Date(dateTimeThisWeekend)
                }
            }
        }]);

        let datePastWeek = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-14);
        let dateTimePastWeek = datePastWeek+'T00:00:00.0Z'
        let dateTimePastWeekend = dateThisWeek+'T23:59:59.0Z'
        const docPastWeek = await Item.aggregate([{
            $match: { 
                completed_at: {
                    $gte: new Date(dateTimePastWeek), $lt: new Date(dateTimePastWeekend)
                }
            }
        }]);

        let dateThisMonth = today.getFullYear()+'-'+(today.getMonth())+'-'+(today.getDate());
        let dateTimeThisMonth = dateThisMonth+'T00:00:00.0Z'
        let dateTimeThisMonthend = date+'T23:59:59.0Z'
        const docThisMonth = await Item.aggregate([{
            $match: { 
                completed_at: {
                    $gte: new Date(dateTimeThisMonth), $lt: new Date(dateTimeThisMonthend)
                }
            }
        }]);

        let datePastMonth = today.getFullYear()+'-'+(today.getMonth()-1)+'-'+(today.getDate());
        let dateTimePastMonth = datePastMonth+'T00:00:00.0Z'
        let dateTimePastMonthend = today.getFullYear()+'-'+(today.getMonth())+'-'+(today.getDate());+'T23:59:59.0Z'
        const docPastMonth = await Item.aggregate([{
            $match: { 
                completed_at: {
                    $gte: new Date(dateTimePastMonth), $lt: new Date(dateTimePastMonthend)
                }
            }
        }]);

        res.status(200).json({
            data: {
                "today": doc_today.length,
                "past_due": docPastDue.length,
                "this_week": docThisWeek.length,
                "past_week": docPastWeek.length,
                "this_month": docThisMonth.length,
                "past_month": docPastMonth.length,
                "total": doc_today.length + docPastDue.length + docThisWeek.length + docPastWeek.length + docThisMonth.length + docPastMonth.length
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

exports.listListItem = async (req, res, next) => {
    try {
        let paramQuery = {}
        if(req.query.filter){
            paramQuery = JSON.parse(req.query.filter)
        }
        const features = new APIFeatures(Item.find(paramQuery), Item, req.query, req)
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
            if(doc[i].completed_by !== undefined){
                attributes.completed_by = doc[i].completed_by
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
            if(doc[i].created_by !== undefined){
                attributes.created_by = doc[i].created_by
            }
            if(doc[i].assignee_id !== undefined){
                attributes.assignee_id = doc[i].assignee_id
            }            
            // "checklist_id": 5756
            // deleted_at
            let item = {
                "type": "items",
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

exports.completeItem = async (req, res, next) => {
    try {
        let data = req.body.data
        let item_res = [] 
        for(let x = 0; x < data.length; x++ ){

            const doc = await Item.findByIdAndUpdate(data[x].id, {$set:{is_completed: true, completed_at: new Date()}}, {
                new: true,
                runValidators: true
            });
            

            let item = {
                item_id : data[x].item_id,
                is_completed : true
            }
            item_res.push(item)

            if(x == (data.length - 1) ){

                res.status(200).json({
                    data: item_res
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

exports.inCompleteItem = async (req, res, next) => {
    try {
        let data = req.body.data
        let item_res = [] 
        for(let x = 0; x < data.length; x++ ){

            const doc = await Item.findByIdAndUpdate(data[x].id, {$set:{is_completed: false, completed_at: new Date()}}, {
                new: true,
                runValidators: true
            });
            

            let item = {
                item_id : data[x].item_id,
                is_completed : false
            }
            item_res.push(item)

            if(x == (data.length - 1) ){

                res.status(200).json({
                    data: item_res
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
