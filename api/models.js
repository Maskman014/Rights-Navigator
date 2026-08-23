const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CaseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  caseData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Case = mongoose.models.Case || mongoose.model('Case', CaseSchema);

module.exports = { User, Case };
