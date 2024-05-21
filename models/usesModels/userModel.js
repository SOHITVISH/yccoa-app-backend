import { DateTime } from "luxon";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_type_id: { type: Number, default: 2 },
    status_type_id: { type: Number },
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String, required: true },
    gender: { type: String },
    password: { type: String },
    photo: { type: String, default: "" },
    company_name: { type: String },
    company_status: { type: Number },
    company_id: { type: String },
    phone: { type: String, default: "" },
    created_at: { type: String, default: DateTime.now().toUTC().toISO() },
    updated_at: { type: String, default: DateTime.now().toUTC().toISO() },
    updated_by: { type: String },
    created_by: { type: String },
    isLoggedin: { type: Boolean },
    total_hours: { type: String },
    employee_id: { type: Number },
    user_admin_status: { type: Number },
    isCompanyDeleted: { type: Boolean },
    isEmployeeDeleted: { type: Boolean },
    isUserAdminDeleted: { type: Boolean },
    city: { type: String },
    admin_id: { type: String },
    verification_code: { type: Number, default: "" },
    code_verified: { type: Boolean, default: false },
    employee_status: { type: Number }, // ACTIVE, TERMINATED, SUSPENDED


});

// userSchema.pre("save", function setDatetime(next) {
//     this.created_at = DateTime.now().toUTC().toISO()
//     this.updated_at = DateTime.now().toUTC().toISO()
//     next()
// })


const userModel = mongoose.model("user", userSchema);
export default userModel
