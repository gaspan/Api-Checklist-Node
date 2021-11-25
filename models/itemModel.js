const mongoose = require("mongoose");
const itemSchema = new mongoose.Schema({
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
  due:{
    type: String,
    default: null
  },
  urgency: {
    type: Number
  },
  updated_by: {
    type: String,
    default: null
  },
  updated_at: {
    type: String,
    default: null
  },
  created_at: {
    type: String,
    default:  Date.now()
  },
  created_by: {
    type: String
  },
  assignee_id: {
    type: String,
    default: null
  },
  task_id: {
    type: Number,
    default: null
  }
  
  
});

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;

