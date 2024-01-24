import express from "express"
/*----------- Middlewares ---------*/
import { verifyToken } from "../middleware/verifyToken.js";
import { getUserInfo } from "../middleware/getUserInfo.js";
import { fadb } from "../dbConfig.js";
import { today, timenow, thisMonth } from "../helpers/local-var.js";
/*-----------------------------------------------*/

const router = express.Router();

/*------------------------------------------------*/
/*------------------------------------------------*/
router.post("/postNew", verifyToken, getUserInfo, async (req, res) => {
    try {
        const date = req.body.date;
        const accident_code = req.body.accident_code;
        const accident_details = req.body.accident_details;
        const team_name = req.body.team_name;
        const team_id = (req.body.team_id) ? req.body.team_id : null;
        const accident_location = req.body.accident_location;
        const leave_count = (req.body.leave_count) ? req.body.leave_count : 0;
        const medical_report = req.body.medical_report;
        const remarks = req.body.remarks;

        let accident_type = '不休業災害';
        if (accident_code == '2') accident_type = '休業災害';
        else if (accident_code == '3') accident_type = '赤チン災害';
        else if (accident_code == '4') accident_type = '無傷災害';

        const insertSql = `INSERT INTO reports.accident_report 
            (date_of_occurance, accident_type, accident_code, leave_count, accident_details, team_id, team_name, accident_location
                , medical_report, remarks, entry_time, entered_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING entry_id`;

        const values = [date, accident_type, accident_code, leave_count, accident_details, team_id, team_name
            , accident_location, medical_report, remarks, timenow(), req.userId];

        const insert = await fadb.query(insertSql, values);

        if (insert.rows.length > 0) {
            res.status(200).json({ message: "success" });
        } else {
            res.status(500).json({ message: "Something went wrong" });
        }

    } catch (err) {
        console.log(err.message)
    }
})
/*------------------------------------------------*/
router.post("/postEdit", verifyToken, getUserInfo, async (req, res) => {
    try {
        const entryID = req.body.entry_id;
        const date = req.body.date;
        const accident_code = req.body.accident_code;
        const accident_details = req.body.accident_details;
        const team_name = req.body.team_name;
        const team_id = (req.body.team_id) ? req.body.team_id : null;
        const accident_location = req.body.accident_location;
        const leave_count = (req.body.leave_count) ? req.body.leave_count : 0;
        const medical_report = req.body.medical_report;
        const remarks = req.body.remarks;

        let accident_type = '不休業災害';
        if (accident_code == '2') accident_type = '休業災害';
        else if (accident_code == '3') accident_type = '赤チン災害';
        else if (accident_code == '4') accident_type = '無傷災害';

        const updateSql = `UPDATE reports.accident_report SET changed_status='true' WHERE entry_id='${entryID}' RETURNING entry_id`;
        const updateNow = await fadb.query(updateSql);

        if (updateNow.rows.length > 0) {
            const insertSql = `INSERT INTO reports.accident_report 
            (date_of_occurance, accident_type, accident_code, leave_count, accident_details, team_id, team_name, accident_location
                , medical_report, remarks, entry_time, entered_by, before_change_entry_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING entry_id`;

            const values = [date, accident_type, accident_code, leave_count, accident_details, team_id, team_name
                , accident_location, medical_report, remarks, timenow(), req.userId, entryID];

            const insert = await fadb.query(insertSql, values);

            if (insert.rows.length > 0) {
                res.status(200).json({ message: "success" });
            } else {
                res.status(500).json({ message: "Something went wrong" });
            }
        } else {
            res.status(500).json({ message: "Something went wrong" });
        }

    } catch (err) {
        console.log(err.message)
    }
})
/*------------------------------------------------*/
router.post("/postDelete", verifyToken, getUserInfo, async (req, res) => {
    try {
        const entryID = req.body.entry_id;

        const deleteSql = `UPDATE reports.accident_report SET delete_status='true' WHERE entry_id='${entryID}' RETURNING entry_id`;
        const deleteNow = await fadb.query(deleteSql);

        if (deleteNow.rows.length > 0) {
            res.status(200).json({ message: "success" });
        } else {
            res.status(500).json({ message: "Error" });
        }
    } catch (err) {
        console.log(err.message)
    }
})
/*------------------------------------------------*/
export default router