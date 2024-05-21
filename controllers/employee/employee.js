import { DateTime } from "luxon";
import jwt from "jsonwebtoken"
import MailSendCustomer from "../sendMail/email.js";
import getisotime from "../../utils/time.js";
import userModel from "../../models/usesModels/userModel.js";
import userModelLog from "../../models/log/userModelLog.js";
import { log } from "../../index.js"

let FILENAME = `employee.js`
let PATH = `controllers/employee/employee.js`


const createemployee = async (req, res) => {
    const { id, first_name, last_name, email, gender, city, employee_status } = req.body;

    try {
        const oldEmployee = await userModel.findOne({ email });
        const companyAdmin = await userModel.findById(id);

        if (oldEmployee) {
            return res.status(400).json({ message: "Email already exist" });
        }
        let result

        let empId = ""
        empId = String(parseInt(Math.abs(Math.random() * 10000)))
        if (empId.length < 4) {
            let i = 2
            while (empId.length < 4) {
                empId = empId + "" + i
                i++
            }
        }
        result = await userModel.create({
            user_type_id: 4,
            first_name,
            employee_id: empId,
            last_name,
            email,
            city,
            gender,
            employee_status,
            isEmployeeDeleted: false,
            created_by: id,
            company_id:companyAdmin.company_id

        });

        let { _id, ...userlog } = result._doc
        await userModelLog.create({
            user_id: result._id,
            ...userlog
        })

        log.info(`Employee created successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: result })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const updateemployee = async (req, res) => {
    let { id, first_name, last_name, email, gender, state, employee_status } = req.body
    let date = getisotime(DateTime)
    try {

        let updateUseradmin = await userModel.findByIdAndUpdate(id, { employee_status, first_name: first_name, last_name: last_name, email: email, gender: gender, state: state, updated_at: date }, { new: true })

        let { _id, ...modifyupdated } = updateUseradmin._doc
        await userModelLog.create({
            user_id: id,
            ...modifyupdated
        })
        log.info(`Employee updated successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Employee update successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const getemployeeprofile = async (req, res) => {
    let { id } = req.body

    try {
        let getprofile = await userModel.findById(id)

        if (!getprofile) {
            return res.status(400).json({ message: "Employee doesn't exit" })
        }
        log.info(`Fetch employee profile successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ profileData: getprofile })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const employeesignin = async (req, res) => {
    let { employee_id } = req.body
    let date = getisotime(DateTime)

    try {
        let user = await userModel.findOne({ employee_id });

        if (!user) {
            return res.status(400).json({ message: "Invalid employee Id" });
        }
        if (user.employee_status != 6) {
            return res.status(400).json({ message: "Your account has been suspended or blocked" })
        }
        if (user.isEmployeeDeleted == true) {
            return res.status(400).json({ message: "Your account has been suspended " })
        }

        let code = ""
        code = String(parseInt(Math.abs(Math.random() * 10000)))

        if (code.length < 4) {
            let i = 2
            while (code.length < 4) {
                .0
                code = code + "" + i
                i++
            }
        }
        var sendMail = {
            from: `yccoa ${process.env.SENDER_EMAIL}`,
            to: user.email,
            subject: "Yccoa App | Verification Code",
            template: "sendMail",
            context: {
                code,
            }
        };
        MailSendCustomer(sendMail)

        let updated = await userModel.findByIdAndUpdate(user._id, { verification_code: code, updated_at: date, updated_by: user._id.toString() }, { new: true })

        let { _id, ...userupdated } = updated._doc
        await userModelLog.create({
            user_id: updated._id,
            ...userupdated
        })

        log.info(`Verification code send successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Verification code send successfully", result: `${user.first_name}`, photo: user.photo, email: user.email })
    } catch (error) {

        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    };
}

export const resendcode = async (req, res) => {
    let { employee_id } = req.body  //it,s EmployeeId
    let date = getisotime(DateTime)
    try {
        let checkId = await userModel.findOne({ employee_id });


        if (!checkId) {
            return res.status(400).json({ message: "Invalid employee Id" });
        }

        let code = ""
        code = String(parseInt(Math.abs(Math.random() * 10000)))

        if (code.length < 4) {
            let i = 2
            while (code.length < 4) {
                code = code + "" + i
                i++
            }
        }
        var sendMail = {
            from: `yccoa ${process.env.SENDER_EMAIL}`,
            to: checkId.email,
            subject: "Verification code",
            template: "sendMail",
            context: {
                code,
            }
        };
        MailSendCustomer(sendMail)

        let updated = await userModel.findByIdAndUpdate(checkId._id, { verification_code: code, updated_at: date, updated_by: checkId._id.toString() }, { new: true })


        let { _id, ...userupdated } = updated._doc
        await userModelLog.create({
            user_id: updated._id,
            ...userupdated
        })

        log.info(`Verification resend code send successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Verification resend code send successfully" })
    } catch (error) {

        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)

    };
}

export const verificationcodeverify = async (req, res) => {
    let { verification_code, employee_id } = req.body
    let date = getisotime(DateTime)

    let secret = process.env.DB_AUTH_SECRET

    try {
        let user = await userModel.findOne({ verification_code, employee_id })

        if (!user) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        let token = ""
        token = jwt.sign({ email: user.email }, secret, { expiresIn: "1h", });

        let updated = await userModel.findByIdAndUpdate(user._id, { code_verified: true, isLoggedin: true, employee_status: 6, updated_at: date, updated_by: user._id.toString() }, { new: true })


        let { _id, ...userupdated } = updated._doc
        await userModelLog.create({
            user_id: updated._id,
            ...userupdated
        })
        log.info(`Employe signin successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Employe signin successfully", result: updated, token })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong " + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }

}

export const updateemployeestatus = async (req, res) => {
    let { user_id, currentStatus } = req.body
    let date = getisotime(DateTime)
    try {
        let updateStatus = await userModel.findByIdAndUpdate(user_id, { employee_status: currentStatus, updated_at: date, updated_by: user_id })

        let { _id, ...modifyupdated } = updateStatus._doc
        await userModel.create({
            user_id: user_id,
            ...modifyupdated
        })

        log.info(`Employe status update successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Status update successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const getallemployee = async (req, res) => {
    let { id } = req.body


    const resultsPerPage = 5;
    let page = req.params.page >= 1 ? req.params.page : 1;
    page = page - 1

    try {


        let allemployee = await userModel.find({ created_by: id, user_type_id: 4, isEmployeeDeleted: false }).sort({ created_at: -1, _id: -1 }).limit(resultsPerPage).skip(resultsPerPage * page)
        let allemployeecount = await userModel.find({ created_by: id, user_type_id: 4, isEmployeeDeleted: false }).countDocuments()
        let userdetails = []
        let created_by = ""
        for (let qq of allemployee) {
            if (qq.created_by) {
                created_by = await userModel.findById(qq.created_by)
                if (created_by) {
                    created_by = { ...created_by._doc, name: `${created_by.first_name} ${created_by.last_name}` }
                } else {
                    created_by = ""
                }
            } else {

            }
            userdetails.push({ ...qq._doc, created_by: created_by ? created_by.name : "" })
        }

        log.info(`Fetch all employe successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: userdetails, empCount: allemployeecount })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const getsingleemployee = async (req, res) => {
    let { id } = req.body
    try {
        let getemployeedoc = await userModel.findById(id)
        log.info(`Fetch single employe successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: getemployeedoc })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const deleteemployee = async (req, res) => {
    let { id } = req.body
    let date = getisotime(DateTime)
    try {
        let deleteemployee = await userModel.findByIdAndUpdate(id, { isEmployeeDeleted: true,employee_status:9, updated_at: date }, { new: true })
        log.info(`Employee deleted successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Employee deleted successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const allemployeeofcompany = async (req, res) => {

    let { id } = req.body

    const resultsPerPage = 5;
    let page = req.params.page >= 1 ? req.params.page : 1;
    page = page - 1
    try {

        // let doc = await userModel.findOne({ company_id: id })
        let empdoc = await userModel.find({ company_id:id, user_type_id: 4, isEmployeeDeleted:false }).sort({ created_at: -1, _id: -1 }).limit(resultsPerPage).skip(resultsPerPage * page)
        let empdoccount = await userModel.find({company_id:id, user_type_id: 4,  }).countDocuments()
        let userdetails = []
        let created_by = ""
        for (let qq of empdoc) {
            if (qq.created_by) {
                created_by = await userModel.findById(qq.created_by)
                if (created_by) {
                    created_by = { ...created_by._doc, name: `${created_by.first_name} ${created_by.last_name}` }
                } else {
                    created_by = ""
                }
            } else {

            }
            userdetails.push({ ...qq._doc, created_by: created_by ? created_by.name : "" })
        }

        res.status(200).json({ result: userdetails, empCount: empdoccount })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
    }

}

export default createemployee


