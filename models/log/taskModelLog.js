import { DateTime } from "luxon";
import mongoose from "mongoose";

const date = new Date();

const taskLogSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, //it is objectID
    employee_id: { type: Number, required: true }, //it is generated EmployeeID
    checked_in: { type: Boolean, default: false },
    checked_in_at: { type: String, default: DateTime.now().toUTC().toISO() },
    checked_in_cord: { type: { type: String, enum: ['Point'] }, coordinates: { type: [Number] } },
    checked_in_location: { type: String },
    checked_out: { type: Boolean, default: false },
    checked_out_at: { type: String, default: DateTime.now().toUTC().toISO() },
    work_duration:{type:String},
    checked_out_cord: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] }
    },
    checked_out_location: { type: String },
    created_at: { type: String, default: DateTime.now().toUTC().toISO() },
    log_created_at: { type: String, default: DateTime.now().toUTC().toISO() },
    updated_at: { type: String, default: DateTime.now().toUTC().toISO() }

});
const taskModelLog = mongoose.model("task_log", taskLogSchema);
export default taskModelLog
