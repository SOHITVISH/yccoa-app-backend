import { DateTime } from "luxon"
import taskModel from "../../models/taskModel/taskModel.js"
import getisotime from "../../utils/time.js"
import taskModelLog from "../../models/log/taskModelLog.js"
import axios from "axios"
import userModel from "../../models/usesModels/userModel.js"
import userModelLog from "../../models/log/userModelLog.js"
import { log } from "../../index.js"

let FILENAME = `task.js`
let PATH = `controllers/task/task.js`


const checkin = async (req, res) => {
    let { user_id, employee_id, checked_in_cord, checked_in_location } = req.body
    let date = getisotime(DateTime)

    try {


        let userdoc = await taskModel.create({
            user_id,
            employee_id,
            checked_in: true,
            checked_out: false,
            checked_in_at: date,
            work_duration: "",
            checked_out_at: "",
            checked_in_cord: { type: 'Point', coordinates: [Number(checked_in_cord.longitude), Number(checked_in_cord.latitude)] },
            checked_out_cord: "",
            checked_in_location,
            checked_out_location: "",
            created_at: date,
            updated_by: user_id
        })

        let { _id, ...userupdated } = userdoc._doc
        await taskModelLog.create({
            user_id,
            ...userupdated
        })

        log.info(`Employee checked in successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: userdoc })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }

}

export const checkout = async (req, res) => {
    let { id, employee_id, checked_out_cord, checked_out_location } = req.body
    let date = getisotime(DateTime)

    try {

     
        let taskdoc = await taskModel.findOneAndUpdate({ _id: id, employee_id }, {
            checked_in: false,
            checked_out: true,
            checked_out_at: date,
            checked_out_cord: { type: 'Point', coordinates: [Number(checked_out_cord.longitude), Number(checked_out_cord.latitude)] },
            checked_out_location,
            updated_at: date,
            updated_by: id

        }, { new: true })

        let tasktime = await taskModel.findById({ _id: id, employee_id })

        let duration = []
        function convertMillisecondsToTime(milliseconds) {

            var hours = milliseconds / (1000 * 60 * 60);
            var remainingMilliseconds = milliseconds % (1000 * 60 * 60);

            var minutes = remainingMilliseconds / (1000 * 60);
            remainingMilliseconds = remainingMilliseconds % (1000 * 60);

            var seconds = remainingMilliseconds / 1000;

            return hours.toString().split(".")[0] + ":" + minutes.toString().split(".")[0] + ":" + seconds.toString().split(".")[0];
        }


        let dt2 = tasktime.checked_out_at
        let dt1 = tasktime.checked_in_at
        let diff_time = (dt2, dt1) => {
            return (new Date(dt2).getTime() - new Date(dt1).getTime());
        }

        let diff_second = (dt2, dt1) => {
            let milliseconds = (new Date(dt2).getTime() - new Date(dt1).getTime());
            var timeString = convertMillisecondsToTime(milliseconds);

        }

        let difference = diff_second(dt2, dt1)
        let newtime = diff_time(dt2, dt1)
        duration.push(newtime)


        const initialValue = 0;
        const sumWithInitial = duration.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            initialValue,
        );
        let totalWorkingHours = convertMillisecondsToTime(sumWithInitial)


        let tasktimeupdate = await taskModel.findOneAndUpdate({ _id: id, employee_id }, {
            work_duration: totalWorkingHours,
            updated_at: date,
            updated_by: tasktime.user_id

        }, { new: true })


        let { _id, ...userupdated } = tasktimeupdate._doc
        await taskModelLog.create({
            user_id: id,
            ...userupdated
        })

        log.info(`Employee checked out successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: taskdoc })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }

}

export const getallsingleusertask = async (req, res) => {
    let { user_id, currentDate } = req.body

    const resultsPerPage = 5;
    let page = req.params.page >= 1 ? req.params.page : 1;
    page = page - 1

    try {
        let userdoc = await userModel.findById(user_id)

        let alltaskhr = await taskModel.find({ user_id, created_at: { $lte: currentDate } })




        let duration = []
        function convertMillisecondsToTime(milliseconds) {

            var hours = milliseconds / (1000 * 60 * 60);
            var remainingMilliseconds = milliseconds % (1000 * 60 * 60);

            var minutes = remainingMilliseconds / (1000 * 60);
            remainingMilliseconds = remainingMilliseconds % (1000 * 60);

            var seconds = remainingMilliseconds / 1000;

            return hours.toString().split(".")[0] + ":" + minutes.toString().split(".")[0] + ":" + seconds.toString().split(".")[0];
        }



        for (let i = 0; i < alltaskhr.length; i++) {
            let dt2 = alltaskhr[i].checked_out_at
            let dt1 = alltaskhr[i].checked_in_at
            let diff_time = (dt2, dt1) => {
                return (new Date(dt2).getTime() - new Date(dt1).getTime());
            }

            let diff_second = (dt2, dt1) => {
                let milliseconds = (new Date(dt2).getTime() - new Date(dt1).getTime());
                var timeString = convertMillisecondsToTime(milliseconds);

            }

            let difference = diff_second(dt2, dt1)
            let newtime = diff_time(dt2, dt1)
            duration.push(newtime)
        }



        const initialValue = 0;
        const sumWithInitial = duration.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            initialValue,
        );
        let totalWorkingHour = convertMillisecondsToTime(sumWithInitial)

        let alltask = await taskModel.find({ user_id, created_at: { $lte: currentDate } }).sort({ created_at: -1, _id: -1 }).limit(resultsPerPage).skip(resultsPerPage * page)
        let alltaskcount = await taskModel.find({ user_id, created_at: { $lte: currentDate } }).countDocuments()

        log.info(`Fetch all single user task successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: alltask, taskCount: alltaskcount, userinfo: userdoc, totalHours: totalWorkingHour })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const checktaskbydate = async (req, res) => {
    let { user_id, date, currentDate, selectedToDate } = req.body


    try {

        const resultsPerPage = 5;
        let page = req.params.page >= 1 ? req.params.page : 1;
        page = page - 1

        const selectedDate = date


        let gettaskforhr = await taskModel.find({ user_id, created_at: { '$gte': `${selectedDate}`, '$lte': `${selectedToDate}` } })


        let duration = []
        function convertMillisecondsToTime(milliseconds) {

            var hours = milliseconds / (1000 * 60 * 60);
            var remainingMilliseconds = milliseconds % (1000 * 60 * 60);

            var minutes = remainingMilliseconds / (1000 * 60);
            remainingMilliseconds = remainingMilliseconds % (1000 * 60);

            var seconds = remainingMilliseconds / 1000;

            return hours.toString().split(".")[0] + ":" + minutes.toString().split(".")[0] + ":" + seconds.toString().split(".")[0];
        }

        for (let i = 0; i < gettaskforhr.length; i++) {

            if (gettaskforhr[i].checked_in_at && gettaskforhr[i].checked_out_at) {
                let dt2 = gettaskforhr[i].checked_out_at
                let dt1 = gettaskforhr[i].checked_in_at

                let diff_time = (dt2, dt1) => {
                    return (new Date(dt2).getTime() - new Date(dt1).getTime());
                }

                let diff_second = (dt2, dt1) => {
                    let milliseconds = (new Date(dt2).getTime() - new Date(dt1).getTime());
                    var timeString = convertMillisecondsToTime(milliseconds);

                }

                let difference = diff_second(dt2, dt1)
                let newtime = diff_time(dt2, dt1)
                duration.push(newtime)
            }
        }

        const initialValue = 0;
        const sumWithInitial = duration.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            initialValue,
        );
        let totalWorkingHoursOneDay = convertMillisecondsToTime(sumWithInitial)

        let gettask = await taskModel.find({ user_id, created_at: { $lte: currentDate }, created_at: { '$gte': `${selectedDate}`, '$lte': `${selectedToDate}` } }).sort({ created_at: -1, _id: -1 }).limit(resultsPerPage).skip(resultsPerPage * page)

        let gettaskcount = await taskModel.find({ user_id, created_at: { '$gte': `${selectedDate}`, '$lte': `${selectedToDate}` } }).countDocuments()


        log.info(`Fetch all task by single date successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: gettask, taskCount: gettaskcount, totalHourOfDay: totalWorkingHoursOneDay })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const taskbytwodate = async (req, res) => {
    let { user_id, fromDate, toDate } = req.body

    try {

        const resultsPerPage = 5;
        let page = req.params.page >= 1 ? req.params.page : 1;
        page = page - 1

        let gettaskhr = await taskModel.find({ user_id, "created_at": { '$gte': fromDate, '$lte': toDate } })

        let duration = []
        function convertMillisecondsToTime(milliseconds) {

            var hours = milliseconds / (1000 * 60 * 60);
            var remainingMilliseconds = milliseconds % (1000 * 60 * 60);

            var minutes = remainingMilliseconds / (1000 * 60);
            remainingMilliseconds = remainingMilliseconds % (1000 * 60);

            var seconds = remainingMilliseconds / 1000;

            return hours.toString().split(".")[0] + ":" + minutes.toString().split(".")[0] + ":" + seconds.toString().split(".")[0];
        }

        for (let i = 0; i < gettaskhr.length; i++) {
            let dt2 = gettaskhr[i].checked_out_at
            let dt1 = gettaskhr[i].checked_in_at
            let diff_time = (dt2, dt1) => {
                return (new Date(dt2).getTime() - new Date(dt1).getTime());
            }

            let diff_second = (dt2, dt1) => {
                let milliseconds = (new Date(dt2).getTime() - new Date(dt1).getTime());
                var timeString = convertMillisecondsToTime(milliseconds);

            }

            let difference = diff_second(dt2, dt1)
            let newtime = diff_time(dt2, dt1)
            duration.push(newtime)


        }
        const initialValue = 0;
        const sumWithInitial = duration.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            initialValue,
        );

        let totalWorkingHoursTwoDays = convertMillisecondsToTime(sumWithInitial)

        let gettask = await taskModel.find({ user_id, "created_at": { '$gte': fromDate, '$lte': toDate } }).sort({ created_at: 1, _id: 1 }).limit(resultsPerPage).skip(resultsPerPage * page)
        let gettaskcount = await taskModel.find({ user_id, "created_at": { '$gte': fromDate, '$lte': toDate } }).countDocuments()
        log.info(`Fetch all task between two date successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: gettask, taskCount: gettaskcount, totalWorkingDuration: totalWorkingHoursTwoDays })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const taskbytwodateforadmin = async (req, res) => {
    let { user_id, fromDate, toDate } = req.body

    try {

        const resultsPerPage = 10;
        let page = req.params.page >= 1 ? req.params.page : 1;
        page = page - 1

        let gettaskhr = await taskModel.find({ user_id, "created_at": { '$gte': fromDate, '$lte': toDate } })

        let gettask = await taskModel.find({ user_id, "created_at": { '$gte': fromDate, '$lte': toDate } }).sort({ created_at: 1, _id: 1 }).limit(resultsPerPage).skip(resultsPerPage * page)

        let userdetails = []

        for (let qq of gettask) {
            let user_id
            if (qq.user_id) {
                user_id = await userModel.findById(qq.user_id)
                if (user_id) {
                    user_id = { ...user_id._doc, name: `${user_id.first_name} ${user_id.last_name}` }
                } else {
                    user_id = ""
                }
            } else {

            }
            userdetails.push({ ...qq._doc, user_id: user_id ? user_id.name : "" })
        }
        let gettaskcount = await taskModel.find({ user_id, "created_at": { '$gte': fromDate, '$lte': toDate } }).countDocuments()
      

        let duration = []
        function convertMillisecondsToTime(milliseconds) {

            var hours = milliseconds / (1000 * 60 * 60);
            var remainingMilliseconds = milliseconds % (1000 * 60 * 60);

            var minutes = remainingMilliseconds / (1000 * 60);
            remainingMilliseconds = remainingMilliseconds % (1000 * 60);

            var seconds = remainingMilliseconds / 1000;

            return hours.toString().split(".")[0] + ":" + minutes.toString().split(".")[0] + ":" + seconds.toString().split(".")[0];
        }

        for (let i = 0; i < gettaskhr.length; i++) {
            let dt2 = gettaskhr[i].checked_out_at
            let dt1 = gettaskhr[i].checked_in_at
            let diff_time = (dt2, dt1) => {
                return (new Date(dt2).getTime() - new Date(dt1).getTime());
            }

            let diff_second = (dt2, dt1) => {
                let milliseconds = (new Date(dt2).getTime() - new Date(dt1).getTime());
                var timeString = convertMillisecondsToTime(milliseconds);

            }

            let difference = diff_second(dt2, dt1)
            let newtime = diff_time(dt2, dt1)
            duration.push(newtime)


        }
        const initialValue = 0;
        const sumWithInitial = duration.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            initialValue,
        );

        let totalWorkingHoursTwoDays = convertMillisecondsToTime(sumWithInitial)

      
        log.info(`Fetch all task between two date successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: userdetails, taskCount: gettaskcount, totalWorkingDuration: totalWorkingHoursTwoDays })

    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}


export const alltaskadmin = async (req, res) => {
    let { updated_by } = req.body
    const resultsPerPage = 10;
    let page = req.params.page >= 1 ? req.params.page : 1;
    page = page - 1
    try {
        let alltaskdoc = await taskModel.find({ updated_by }).sort({ created_at: -1, _id: -1 }).limit(resultsPerPage).skip(resultsPerPage * page)
        let alltaskcount = await taskModel.find({ updated_by }).countDocuments()

        log.info(`Fetch all task for admin successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ result: alltaskdoc, allTaskCount: alltaskcount })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}

export const alltaskofsinglecompany = async (req, res) => {
    let { id } = req.body

    const resultsPerPage = 10;
    let page = req.params.page >= 1 ? req.params.page : 1;
    page = page - 1
    try {

        let doc = await userModel.findOne({ company_id: id }) // subadmin
        let udoc = await userModel.findOne({ created_by: doc._id.toString(), user_type_id: 4, employee_status: 6 })
        // let userdoc = await userModel.findOne({ created_by: doc._id.toString(), user_type_id: 4, employee_status: 6 })
        let taskdoc = await taskModel.find({ user_id: udoc._id.toString() }).sort({ created_at: -1, _id: -1 }).limit(resultsPerPage).skip(resultsPerPage * page)
        let taskdocCount = await taskModel.find({ user_id: udoc._id.toString() }).countDocuments()

        let userdetails = []
        let user_id = ""
        for (let qq of taskdoc) {
            if (qq.user_id) {
                user_id = await userModel.findById(qq.user_id)
                if (user_id) {
                    user_id = { ...user_id._doc, name: `${user_id.first_name} ${user_id.last_name}` }
                } else {
                    user_id = ""
                }
            } else {

            }
            userdetails.push({ ...qq._doc, user_id: user_id ? user_id.name : "" })
        }


        res.status(200).json({ result: userdetails, allTaskOfCompanyCount: taskdocCount })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
    }
}


export const totalhour = async (req, res) => {
    let { user_id } = req.body


    try {
        let userdoc = await userModel.findById(user_id)

        let alltaskhr = await taskModel.find({ user_id })

        let duration = []
        function convertMillisecondsToTime(milliseconds) {

            var hours = milliseconds / (1000 * 60 * 60);
            var remainingMilliseconds = milliseconds % (1000 * 60 * 60);

            var minutes = remainingMilliseconds / (1000 * 60);
            remainingMilliseconds = remainingMilliseconds % (1000 * 60);

            var seconds = remainingMilliseconds / 1000;

            return hours.toString().split(".")[0] + ":" + minutes.toString().split(".")[0] + ":" + seconds.toString().split(".")[0];
        }

        for (let i = 0; i < alltaskhr.length; i++) {

            if (alltaskhr[i].checked_in_at && alltaskhr[i].checked_out_at) {
                let dt2 = alltaskhr[i].checked_out_at
                let dt1 = alltaskhr[i].checked_in_at
                let diff_time = (dt2, dt1) => {
                    return (new Date(dt2).getTime() - new Date(dt1).getTime());
                }

                let diff_second = (dt2, dt1) => {
                    let milliseconds = (new Date(dt2).getTime() - new Date(dt1).getTime());
                    var timeString = convertMillisecondsToTime(milliseconds);

                }

                let difference = diff_second(dt2, dt1)
                let newtime = diff_time(dt2, dt1)
                duration.push(newtime)
            }
        }

        const initialValue = 0;
        const sumWithInitial = duration.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            initialValue,
        );
        let totalWorkingHour = convertMillisecondsToTime(sumWithInitial)

        let userupdate = await userModel.findByIdAndUpdate(user_id, { total_hours: totalWorkingHour }, { new: true })

        let { _id, ...userlog } = userupdate._doc
        await userModelLog.create({
            user_id,
            ...userlog
        })

        log.info(`Fetch total hours successfully-  FileName-${FILENAME} - Path-${PATH}`)
        res.status(200).json({ totalHours: totalWorkingHour })
    } catch (error) {
        res.status(400).json({ message: "Something went wrong" + error })
        log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
    }
}


export default checkin   