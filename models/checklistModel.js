const mongoose = require("mongoose");
const checklistSchema = new mongoose.Schema({
  object_domain: {
    type: String,
    required: [true, "Please fill items object domain"],
  },
  object_id: {
    type: String,
    required: [true, "Please fill items object id"],
  },
  description: {
    type: String,
    required: [true, "Please fill items description"],
  },
  is_completed: {
      type: Boolean,
      default: 'false'
  },
  completed_at: {
      type: String,
      default: null
  },
  updated_by: {
      type: String,
      default: null
  },
  updated_at: {
    type: Date,
    // default:  Date.now()
  },
  created_by: {
    type: String
  },
  created_at: {
    type: Date,
    default:  Date.now()
  },
  due:{
    type: String
  },
  urgency: {
    type: Number
  },
  task_id: {
      type: String
  }
  
});

const Checklist = mongoose.model("Checklist", checklistSchema);
module.exports = Checklist;

