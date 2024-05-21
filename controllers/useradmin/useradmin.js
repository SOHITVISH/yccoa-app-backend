import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import userModel from "../../models/usesModels/userModel.js";
import userModelLog from "../../models/log/userModelLog.js";
import getisotime from "../../utils/time.js";
import { DateTime } from "luxon";
import { log } from "../../index.js"


let FILENAME = `useradmin.js`
let PATH = `controllers/useradmin/useradmin.js`

const createuseradmin = async (req, res) => {
    const { company_id, first_name, last_name, email, password, gender, status, user_admin_status, phone } = req.body;

    let secret = process.env.DB_AUTH_SECRET
    try {

        const oldUserAdmin = await userModel.findOne({ email });

        if (oldUserAdmin) {
            return res.status(400).json({ message: "Email already exist" });
        }
        let result
        const hashedPassword = await bcrypt.hash(password, 12);


        let adminID = ""
        adminID = String(parseInt(Math.abs(Math.random() * 10000)))
        if (adminID.length < 4) {
            let i = 2
            while (adminID.length < 4) {
                adminID = adminID + "" + i
                i++
            }
        }
        let token = ''
        token = jwt.sign({ email: email }, secret, { expiresIn: "1h", });
        let companydoc = await userModel.findById(company_id)

        result = await userModel.create({
            user_type_id: 3,
            company_id,
            first_name,
            admin_id: adminID,
            last_name,
            email,
            password: hashedPassword,
            gender,
            status,
            phone,
            user_admin_status,
            isUserAdminDeleted: false,
            created_by: companydoc.company_name

        });


        let { _id, ...userlog } = result._doc
        await userModelLog.create({
            user_id: result._id,
            ...userlog
        })

        log.info(`Company admin created successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(201).json({ result: result, token })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)

    }
}

export const updateuseradmin = async (req, res) => {
    let { id, first_name, last_name, email, password, gender, phone, user_admin_status } = req.body

    let date = getisotime(DateTime)
    try {

        let updateUseradmin = await userModel.findByIdAndUpdate(id, { user_admin_status, first_name: first_name, last_name: last_name, email: email, password: password, gender: gender, phone: phone, updated_at: date }, { new: true })

        let { _id, ...modifyupdated } = updateUseradmin._doc
        await userModelLog.create({
            user_id: id,
            ...modifyupdated
        })
        log.info(`Company admin update successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "Admin user update successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)

    }
}

export const getalluseradmin = async (req, res) => {
    let { company_id } = req.body

    try {
        let alluseradmin = await userModel.find({ company_id, user_type_id: 3, isUserAdminDeleted: false })


        log.info(`Fetch all user admin successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: alluseradmin })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}




export const getsingleuseradmin = async (req, res) => {
    let { id } = req.body
    try {
        let getsingleuseradmin = await userModel.findById(id)
        log.info(`Fetch single user admin successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: getsingleuseradmin })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}


export const deleteuseradmin = async (req, res) => {
    let { id } = req.body
    let date = getisotime(DateTime)
    try {
        let deleteemployee = await userModel.findByIdAndUpdate(id, { isUserAdminDeleted: true, updated_at: date }, { new: true })
        log.info(`Delete user admin successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "User admin deleted successfully" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}
export default createuseradmin










