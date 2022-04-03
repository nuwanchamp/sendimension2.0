const { string, number } = require("joi");
const db = require("./db.service");
const mongoose = db.getDb();

mongoose.set('runValidators', true);

const attendanceSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    emp_id: { type: String, required: true },
    type: { type: String, required: true },
    tstamp: { type: String, required: true },
}, { strict: false });
const Attendance = new mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;