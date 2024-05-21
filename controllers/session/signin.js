import userModel from "../../models/usesModels/userModel.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { log } from "../../index.js"
import getisotime from "../../utils/time.js";
import { DateTime } from "luxon";
import userModelLog from "../../models/log/userModelLog.js";


let FILENAME = `signin.js`
let PATH = `controllers/session/signin.js`


const signin = async (req, res) => {
    const { email, password } = req.body;
    let secret = process.env.DB_AUTH_SECRET
    let date = getisotime(DateTime)
    try {
        let oldUser = await userModel.findOne({ email });

        if (!oldUser) {
            return res.status(400).json({ message: "Email doesn't exist" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        let token
        if (oldUser.user_type_id == 1) {
            token = jwt.sign({ email: oldUser.email, user_type_id: oldUser.user_type_id }, secret, { expiresIn: "1h", });

            res.cookie("user_data", oldUser.user_type_id, { maxAge: 1000 * 60 * 60, secure: true })

            log.info(`Super admin signin successfully-  FileName-${FILENAME} - Path-${PATH}`)
            res.status(201).json({ result: oldUser, token })
            return
        } else if (oldUser.user_type_id == 2) {

            if (oldUser.isCompanyDeleted == true) {
                return res.status(400).json({ message: "Your account has been suspended" });
            }
            if (oldUser.company_status != 1) {
                return res.status(400).json({ message: "Your account has been suspended or blocked" });
            }


            token = jwt.sign({ email: oldUser.email }, secret, { expiresIn: "1h", });

            let updatedoc = await userModel.findByIdAndUpdate(oldUser._id.toString(), { company_status: 1, updated_at: date, updated_by: oldUser._id.toString() }, { new: true })

            let { _id, ...modifyupdate } = updatedoc._doc
            await userModelLog.create({
                user_id: oldUser._id,
                ...modifyupdate
            })

            res.cookie("user_data", oldUser.user_type_id, { maxAge: 1000 * 60 * 60, secure: true })
            log.info(`Company signin successfully-  FileName-${FILENAME} - Path-${PATH}`)
            res.status(201).json({ result: oldUser, token })
            return
        } else if (oldUser.user_type_id == 3) {

            console.log(oldUser, "_____________olduserrrr");
            if (oldUser.isUserAdminDeleted == true) {
                return res.status(400).json({ message: "Your account has been suspended" });
            }

            if (oldUser.user_admin_status != 4) {
                return res.status(400).json({ message: "Your account has been suspended or blocked" });
            }

            token = jwt.sign({ email: oldUser.email }, secret, { expiresIn: "1h", });

            let updatedoc = await userModel.findByIdAndUpdate(oldUser._id.toString(), { employee_status: 6, updated_at: date, updated_by: oldUser._id.toString() }, { new: true })

            let { _id, ...modifyupdate } = updatedoc._doc
            await userModelLog.create({
                user_id: oldUser._id,
                ...modifyupdate
            })

            res.cookie("user_data", oldUser.user_type_id, { maxAge: 1000 * 60 * 60, secure: true })

            log.info(`Company admin signin successfully-  FileName-${FILENAME} - Path-${PATH}`)
            res.status(201).json({ result: oldUser, token })
            return

        }
    } catch (error) {

        res.status(500).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)

    };
}

export const signout = async (req, res) => {
    let { user_id } = req.body
    let date = getisotime(DateTime)

    try {
        let loggedinstatus = await userModel.findByIdAndUpdate(user_id, { isLoggedIn: false, updated_at: date, updated_by: user_id }, { new: true })
        log.info(`SignOut successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ message: "SignOut Succesfully" })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const getsingleuser = async (req, res) => {
    let { id } = req.body
    try {
        let result = await userModel.findById(id)
        log.info(`Fetch single user successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result })

    } catch (error) {
        res.status(200).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export default signin