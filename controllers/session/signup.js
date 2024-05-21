import userModel from "../../models/usesModels/userModel.js";
import bcrypt from "bcryptjs"
import { log } from "../../index.js"
import userModelLog from "../../models/log/userModelLog.js";


let FILENAME = `signup.js`
let PATH = `controllers/session/signup.js`


const signup = async (req, res) => {

    const { first_name, last_name, email, phone, password } = req.body;
    let result

    try {

        const oldUser = await userModel.findOne({ email });

        if (oldUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        result = await userModel.create({
            first_name,
            last_name,
            email,
            phone,
            password: hashedPassword,

        });
        log.info(`signup successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(201).json({ result: result })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" + error });
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)

    }
}

export const updatePassword = async (req, res) => {

    const { password, email } = req.body

    try {


        let user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email doesn't exist" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        let updatePassword = await userModel.findByIdAndUpdate(user._id, { password: hashedPassword, updated_by: user._id })



        let { _id, ...modifyupdate } = updatePassword._doc
        await userModelLog.create({
            user_id: user._id,
            ...modifyupdate
        })




        res.status(200).json({ message: "Password reset successfully", reset: true })

    } catch (error) {

        res.status(404).json({ message: "Something went wrong" + error });
    }

}


export default signup