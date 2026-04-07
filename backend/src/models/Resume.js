const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  personalInfo: {
    name: String,
    email: String,
    phone: String,
  },
  experience: Array,
  education: Array,
  skills: Array,
  aiSummary: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);