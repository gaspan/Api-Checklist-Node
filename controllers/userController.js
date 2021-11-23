const User = require('../models/userModel');
const base = require('./baseController');

exports.getUser = base.getOne(User);

// Don't update password on this 
exports.updateUser = base.updateOne(User);
exports.deleteUser = base.deleteOne(User);