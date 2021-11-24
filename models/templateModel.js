const mongoose = require("mongoose");
const templateSchema = new mongoose.Schema({
  name: {
    type: String
  },
  checklist: {
    description: {
        type: String,
        required: [true, "Please fill checklist description"],
    },
    due_interval:  Number,
    due_unit: {
        type: String,
        enum: ['minute', 'hour', 'day', 'week', 'month']
    }
  },
  items: [
      { 
          description: {
                type: String,
                required: [true, "Please fill items description"],
            },
          urgency: Number,
          due_interval: Number,
          due_unit: {
                type: String,
                enum: ['minute', 'hour', 'day', 'week', 'month']
            }
        }
    ],
  
});

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;

