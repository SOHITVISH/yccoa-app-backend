import express from "express";
const router = express.Router();
import createcompany, { deletecompany, getallcompany, getemployeeofsinglecompanysearch, getsinglecompany, restorecompany, updatecompany, updatecompanystatus } from "../controllers/company/company.js";
import signup, { updatePassword } from "../controllers/session/signup.js";
import signin, { getsingleuser } from "../controllers/session/signin.js";
import createemployee, { allemployeeofcompany, deleteemployee, employeesignin, getallemployee, getemployeeprofile, getsingleemployee, resendcode, updateemployee, updateemployeestatus, verificationcodeverify } from "../controllers/employee/employee.js";
import checkin, { alltaskadmin, alltaskofsinglecompany, checkout, checktaskbydate, getallsingleusertask, taskbytwodate, taskbytwodateforadmin, totalhour } from "../controllers/task/task.js";
import createuseradmin, { deleteuseradmin, getalluseradmin, getsingleuseradmin, updateuseradmin } from "../controllers/useradmin/useradmin.js";
import auth from "../middleware/auth.js";


router.post("/signup", signup)
router.post("/signin", signin)
router.post("/createcompany", createcompany)
router.post("/createemployee", createemployee)
router.post("/getemployeeprofile", getemployeeprofile)
router.get("/getallcompany", getallcompany)
router.post("/getsingleuser", getsingleuser)
router.post("/checkin", checkin)
router.post("/updatecompany", updatecompany)
router.post("/getsinglecompany", getsinglecompany)
router.post("/updateuseradmin", updateuseradmin)
router.post("/updateemployee", updateemployee)
router.post("/getsingleemployee", getsingleemployee)
router.post("/getsingleuseradmin", getsingleuseradmin)
router.post("/deleteemployee", deleteemployee)
router.post("/deleteuseradmin", deleteuseradmin)
router.post("/deletecompany", deletecompany)
router.post("/totalhour", totalhour)
router.post("/checkout", checkout)
router.post("/createuseradmin", createuseradmin)
router.post("/getalluseradmin", getalluseradmin)
router.post("/checktaskbydate/:page", checktaskbydate)
router.post("/taskbytwodate/:page", taskbytwodate)
router.post("/getallsingleusertask/:page", getallsingleusertask)
router.post("/getallemployee/:page", getallemployee)
router.post("/employeesignin", employeesignin)
router.post("/resendcode", resendcode)
router.post("/verificationcodeverify", verificationcodeverify)
router.post("/updateemployeestatus", updateemployeestatus)
router.post("/updatecompanystatus", updatecompanystatus)
router.get("/alltaskadmin/:page", alltaskadmin)
router.post("/allemployeeofcompany/:page", allemployeeofcompany)
router.post("/restorecompany", restorecompany)
router.post("/alltaskofsinglecompany/:page", alltaskofsinglecompany)
router.post("/taskbytwodateforadmin/:page", taskbytwodateforadmin)
router.post("/getemployeeofsinglecompanysearch", getemployeeofsinglecompanysearch)
router.post("/updatePassword", updatePassword)

export default router;
