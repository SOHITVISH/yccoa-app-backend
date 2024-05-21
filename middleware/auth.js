
import { } from 'dotenv/config'
import jwt from "jsonwebtoken"
const SECRET_KEY = process.env.DB_AUTH_SECRET;


const auth = (req, res, next) => {
    try {
        let token
        if (req.cookies.token || req.headers.authorization) {

            let newToken
            if (req.cookies.token) {

                newToken = req.cookies.token

            } else {

                let objs = req.headers.authorization.replace("Bearer", "");
                newToken = objs.trim()

            }

            let user = jwt.verify(newToken, SECRET_KEY);
            req.user = user
            next();
        } else {
            res.status(400).json({ message: "Unauthorized access not allowed" })
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: "Unauthorized access not allowed" })
    }
}

export default auth
