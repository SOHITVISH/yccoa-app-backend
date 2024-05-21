import { DateTime } from "luxon";
import mongoose from "mongoose";

const userLogSchema = new mongoose.Schema({
    user_type_id: { type: Number },
    company_id: { type: String }, // its basically object_id
    status_type_id: { type: Number },
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String, required: true },
    gender: { type: String },
    password: { type: String },
    photo: { type: String, default: "" },
    isLoggedin: { type: Boolean },
    company_name: { type: String },
    company_id: { type: String },
    employee_id:{type:Number},
    company_status: { type: Number },
    isCompanyDeleted: { type: Boolean },
    isEmployeeDeleted: { type: Boolean },
    isUserAdminDeleted: { type: Boolean },
    user_admin_status: { type: Number },
    created_by: { type: String },
    phone: { type: String, default: "" },
    city: { type: String },
    total_hours: { type: String },
    created_at: { type: String, default: DateTime.now().toHTTP() },
    updated_at: { type: String, default: DateTime.now().toHTTP() },
    log_created_at: { type: String, default: DateTime.now().toHTTP() },
    updated_by: { type: String },
    employee_status: { type: Number },
});

// userSchema.pre("save", function setDatetime(next) {
//     this.created_at = DateTime.now().toUTC().toISO()
//     this.updated_at = DateTime.now().toUTC().toISO()
//     next()
// })


const userModelLog = mongoose.model("user_log", userLogSchema);
export default userModelLog
