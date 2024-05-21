import express from 'express'
import connect from './database/database.js'
import http from "http"
import { } from "dotenv/config"
import userRouter from "./routes/route.js"
import cookieParser from 'cookie-parser'
import cors from "cors"
import statusTypeModel from './models/statusTypes/statusTypeModel.js'
import userType from './models/userTypes/userTypeModel.js'
import { DateTime } from 'luxon'
import getisotime from './utils/time.js'
import userModel from './models/usesModels/userModel.js'
import userModelLog from './models/log/userModelLog.js'
import { initializeApp } from "firebase/app"
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import multer from "multer";
import log4js from "log4js";
import moment from 'moment/moment.js'
import taskModel from './models/taskModel/taskModel.js'


const app = express();
app.use(express.json({ extended: true }));
app.use(cookieParser());

const server = http.createServer(app);
const PORT = process.env.SERVER_PORT || 8080;


connect();

app.use(
    cors({
        credentials: true,
        origin: ['http://localhost:3000',
            "https://yccoaapi.ityogistech.com",
            "https://yccoa.ityogistech.com"]
    })
);
app.use("/api/users", userRouter);
app.get("/api", (req, res) => {
    res.send("Welcome to YCCOA App API");
});

log4js.configure({
    appenders: {
        yccoa_app: {
            type: "file",
            filename: `../log/${DateTime.now().toFormat("LLLL dd, yyyy")}- YCCOA_app_log.log`,
        },
    },
    categories: { default: { appenders: ["yccoa_app"], level: "trace" } },
});

export const log = log4js.getLogger("yccoaa_app");


const firebaseConfig = {
    storageBucket: process.env.STORAGE_BUCKET,
    apiKey: process.env.STORAGE_API_KEY
}

const firebaseapp = initializeApp(firebaseConfig)

export const firebasestorage = getStorage(firebaseapp)

const storage = multer.memoryStorage()

const upload = multer({ storage });


app.post("/api/upload/profile", upload.single("photo"), async (req, res) => {
    let { id, photo } = req.body;
    let date = getisotime(DateTime)
    try {

        let userprofile = await userModel.findByIdAndUpdate(id, { photo, updated_by: id, updated_at: date }, { new: true });
        let { _id, ...modifyuserprofile } = userprofile._doc;

        await userModelLog.create({
            user_id: id,
            ...modifyuserprofile,

        });

        res.status(200).json({ message: "save profile", photo: userprofile.photo });
    } catch (error) {
        res.status(400).json({ message: "something went wrong " + error });

    }
}
);

app.delete("/api/removeprofilephoto", async (req, res) => {
    let { id } = req.body;

    let date = getisotime(DateTime)
    try {
        let oldprodoc = await userModel.findById(id)
        console.log(oldprodoc, "____________oldprodoc");

        let proinfo = await userModel.findByIdAndUpdate(id, { photo: "", updated_by: id, updated_at: date, }, { new: true });
        let { _id, ...modifyproinfo } = proinfo._doc;

        await userModelLog.create({
            ...modifyproinfo,
            user_id: id,

        });

        res.status(200).json({ message: "Deleted" })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
    }
})


app.use("/config/statustype", async (req, res) => {
    await statusTypeModel.create({ status_type: "EMPLOYEE ACTIVE", status_type_id: 6 });
    await statusTypeModel.create({ status_type: "EMPLOYEE INACTIVE", status_type_id: 7 });
    await statusTypeModel.create({ status_type: "EMPLOYEE BLOCKED", status_type_id: 8 });
    await statusTypeModel.create({ status_type: "EMPLOYEE DELETE", status_type_id: 9 });
    await statusTypeModel.create({ status_type: "COMPANY ACTIVE", status_type_id: 1 });
    await statusTypeModel.create({ status_type: "COMPANY INACTIVE", status_type_id: 2 });
    await statusTypeModel.create({ status_type: "COMPANY BLOCKED", status_type_id: 3 });
    await statusTypeModel.create({ status_type: "USER ADMIN ACTIVE", status_type_id: 4 });
    await statusTypeModel.create({ status_type: "USER ADMIN BLOCKED", status_type_id: 5 });


    res.status(200).json({ message: "StatusType Created" });
})

app.get("/config/usertype", async (req, res) => {
    await userType.create({ user_type_id: 1, user_type: "ADMIN" });
    await userType.create({ user_type_id: 2, user_type: "COMPANY" });
    await userType.create({ user_type_id: 3, user_type: "USERADMIN" });
    await userType.create({ user_type_id: 4, user_type: "EMPLOYEE" });

    res.status(200).json({ message: "UserType Created" });
});

app.get("/check", async (req, res) => {
    res.status(200).json({ message: "Hii This is check message" });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

