import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import userModel from "../../models/usesModels/userModel.js";
import userModelLog from "../../models/log/userModelLog.js";
import getisotime from "../../utils/time.js";
import { DateTime } from "luxon";
import { log } from "../../index.js"

let FILENAME = `company.js`
let PATH = `controllers/company/company.js`

const createcompany = async (req, res) => {
    const { company_name, email, phone, password, company_status } = req.body;
    let secret = process.env.DB_AUTH_SECRET

    try {
        const oldCompany = await userModel.findOne({ email });
        const cId = await userModel.findOne({ user_type_id: 1 });

        if (oldCompany) {
            return res.status(400).json({ message: "Email already exist" });
        }
        let result
        const hashedPassword = await bcrypt.hash(password, 12);
        let token = ""
        token = jwt.sign({ email: email }, secret, { expiresIn: "1h", });

        result = await userModel.create({

            company_name,
            email,
            isCompanyDeleted: false,
            phone,
            company_status,
            password: hashedPassword,
            created_by: `${cId.first_name} ${cId.last_name}`
        });



        let { _id, ...companyupdated } = result._doc
        await userModelLog.create({
            company_id: result._id,
            ...companyupdated
        })

        log.info(`Company created successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(201).json({ result: result, token })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)

    }
}

export const updatecompany = async (req, res) => {
    let { id, company_name, email, phone, password, company_status } = req.body
    let date = getisotime(DateTime)
    try {

        const cId = await userModel.findOne({ user_type_id: 1 });
        let updateCompany = await userModel.findByIdAndUpdate(id, { company_status: company_status, company_name: company_name, email: email, phone: phone, password: password, updated_by: cId._id.toString(), updated_at: date }, { new: true })




        if (company_status == 3) {
            let companyadmin = await userModel.updateMany({ company_id: id }, { isUserAdminDeleted: true }, { new: true })
            let addoc = await userModel.findOne({ company_id: id, user_type_id: 3 })
            let empdoc = await userModel.updateMany({ created_by: addoc._id.toString(), user_type_id: 4 }, { isEmployeeDeleted: true }, { new: true })
        }

        if (company_status == 1) {
            let companyadmin = await userModel.updateMany({ company_id: id }, { isUserAdminDeleted: false }, { new: true })
            let addoc = await userModel.findOne({ company_id: id, user_type_id: 3 })
            let empdoc = await userModel.updateMany({ created_by: addoc._id.toString(), user_type_id: 4 }, { isEmployeeDeleted: false }, { new: true })
        }


        let { _id, ...modifyupdated } = updateCompany._doc
        await userModelLog.create({
            company_id: id,
            ...modifyupdated
        })
        log.info(`Company update successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Company update successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const updatecompanystatus = async (req, res) => {
    let { company_id, currentStatus } = req.body
    let date = getisotime(DateTime)
    try {

        const cId = await userModel.findOne({ user_type_id: 1 });
        let updateStatus = await userModel.findByIdAndUpdate(company_id, { company_status: currentStatus, updated_at: date, updated_by: cId._id.toString() }, { new: true })

        let { _id, ...modifyupdated } = updateStatus._doc
        await userModelLog.create({
            company_id,
            ...modifyupdated
        })
        log.info(`Status update successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Status update successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}
export const deletecompany = async (req, res) => {
    let { id } = req.body
    try {
        let deletecompany = await userModel.findByIdAndUpdate(id, { isCompanyDeleted: true }, { new: true })
        let companyadmin = await userModel.updateMany({ company_id: id }, { isUserAdminDeleted: true }, { new: true })

        let addoc = await userModel.findOne({ company_id: id, user_type_id: 3 })

        let empdoc = await userModel.updateMany({ created_by: addoc._id.toString(), user_type_id: 4 }, { isEmployeeDeleted: true }, { new: true })

        let { _id, ...modifyupdated } = deletecompany._doc
        await userModelLog.create({
            company_id: id,
            ...modifyupdated
        })
        log.info(`Company deleted successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Company deleted successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const restorecompany = async (req, res) => {
    let { id } = req.body
    try {
        let restorecompany = await userModel.findByIdAndUpdate(id, { isCompanyDeleted: false }, { new: true })
        let companyadmin = await userModel.updateMany({ company_id: id }, { isUserAdminDeleted: false }, { new: true })

        let addoc = await userModel.findOne({ company_id: id, user_type_id: 3 })
        let empdoc = await userModel.updateMany({ created_by: addoc._id.toString(), user_type_id: 4 }, { isEmployeeDeleted: false }, { new: true })



        let { _id, ...modifyupdated } = restorecompany._doc
        await userModelLog.create({
            company_id: id,
            ...modifyupdated
        })
        log.info(`Company restore successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Company restore successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const getsinglecompany = async (req, res) => {
    let { id } = req.body
    try {
        let getcompanydoc = await userModel.findById(id)
        log.info(`Fetch single company successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: getcompanydoc })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const getallcompany = async (req, res) => {

    try {
        let allcompany = await userModel.find({ user_type_id: 2 })
        log.info(`Fetch all company successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: allcompany })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const getemployeeofsinglecompanysearch = async (req, res) => {
    let { id } = req.body

    try {

        // let doc = await userModel.findOne({ company_id: id })
        let empdoc = await userModel.find({ company_id:id, user_type_id: 4})
        // let employee = empdoc.map(e => {
        //     return `${e.first_name} ${e.last_name} `

        // })
        res.status(200).json({ result: empdoc })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
    }
}

export default createcompany