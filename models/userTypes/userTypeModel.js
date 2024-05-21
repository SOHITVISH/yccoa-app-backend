import { DateTime } from "luxon";
import mongoose from "mongoose";

const date = new Date();

const userSchema = new mongoose.Schema({
    user_type_id: { type: Number, required: true },
    user_type: { type: String, required: true },
    created_at: { type: String, default: DateTime.now().toUTC().toISO() }

});
const userType = mongoose.model("user_type", userSchema);
export default userType
