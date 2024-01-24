import express from "express"
/*----------- Middlewares ---------*/
import { fadb } from "../dbConfig.js";
import { today, timenow, thisMonth } from "../helpers/local-var.js";
/*-----------------------------------------------*/

const router = express.Router();

/*------------------------------------------------*/
router.get("/", async (req, res) => {
    try {
        res.render('pages/hw-cal');
    } catch (err) {
        res.status(500).send(err)
    }
});
/*------------------------------------------------*/
router.get("/fw-cal", async (req, res) => {
    try {
        res.render('pages/fw-cal');
    } catch (err) {
        res.status(500).send(err)
    }
});
/*------------------------------------------------*/
router.get("/hw-cal", async (req, res) => {
    try {
        res.render('pages/hw-cal');
    } catch (err) {
        res.status(500).send(err)
    }
});
/*------------------------------------------------*/
router.get('/info/:date/:team', async (req, res) => {
    const data = await fetchAccidentReport(req.params.date, req.params.team);
    res.json({ info: data })
})
/*------------------------------------------------*/
router.get('/infoMonthly/:month', async (req, res) => {
    try {
        const sql = `SELECT entry_id, LEFT(date_of_occurance::TEXT,10) AS date_of_occurance, accident_type, accident_code
                        , leave_count, accident_details, team_id, team_name, accident_location
                        , medical_report, remarks, entered_by, entry_time, changed_status, before_change_entry_id, delete_status
                    FROM reports.accident_report
                    WHERE delete_status='false' AND changed_status='false' 
                    AND date_of_occurance::TEXT LIKE '%${req.params.month}%' 
                    ORDER BY date_of_occurance ASC`;

        const data = await fadb.query(sql);

        let result = null;

        if (data.rows.length > 0) {
            result = data.rows;
        }

        res.status(200).json({ data: result });

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
})
/*------------------------------------------------*/
router.get('/infoDetails/:infoID', async (req, res) => {
    try {
        const sql = `SELECT entry_id, LEFT(date_of_occurance::TEXT,10) AS date_of_occurance, accident_type, accident_code
                        , leave_count, accident_details, team_id, team_name, accident_location
                        , medical_report, remarks, entered_by, entry_time, changed_status, before_change_entry_id, delete_status
                    FROM reports.accident_report
                    WHERE delete_status='false' AND changed_status='false' 
                    AND entry_id='${req.params.infoID}' 
                    ORDER BY date_of_occurance DESC LIMIT 5 `;

        const data = await fadb.query(sql);

        let result = null;

        if (data.rows.length > 0) {
            result = data.rows[0];
        }

        res.status(200).json({ data: result });

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
})
/*------------------------------------------------*/
router.get('/current-count', async (req, res) => {
    const sql = `SELECT LEFT(maxdate::text,10) as final_date 
                FROM (SELECT MAX(date_of_occurance) AS maxdate FROM reports.accident_report 
                WHERE accident_code<>'0' AND accident_code<>'3' AND accident_code<>'4')t1`;

    const maxdate = await fadb.query(sql);
    const finaldate = (maxdate.rows.length > 0) ? new Date(maxdate.rows[0].final_date) : new Date();
    const currentDate = new Date(today());

    const daysPassedSinceLastAccident = currentDate - finaldate;

    let nextGoal = 1000;
    if (daysPassedSinceLastAccident >= nextGoal) {
        nextGoal = nextGoal + 500;
    }

    res.json({ next_goal: nextGoal, passed_day_count: daysPassedSinceLastAccident });
})
/*------------------------------------------------*/
router.get('/count/:company', async (req, res) => {

    let con = ``;

    if (req.params.company == 'tyk') {
        con = ` AND team_id<='20'`;
        // con = `AND (team_name='PC' OR team_name='PP' OR team_name='FCS' OR team_name='RRO' OR team_name='RRA') `
    } else if (req.params.company == 'tyk_gr') {
        // con = ` AND team_id>'20'`;
    }

    const sql = `SELECT LEFT(maxdate::text,10) as final_date 
                FROM (SELECT MAX(date_of_occurance) AS maxdate FROM reports.accident_report 
                WHERE delete_status='false' AND changed_status='false' AND accident_code<>'0' AND accident_code<>'3' AND accident_code<>'4' ${con})t1`;

    const maxdate = await fadb.query(sql);
    const lastEntry = (maxdate.rows.length > 0) ? new Date(maxdate.rows[0].final_date) : new Date();

    const daysPassedSinceLastAccident = dayDifference(lastEntry);

    const sql_findBest = `SELECT MAX(date_diff) as best_val FROM
                                            (SELECT d1-d2 AS date_diff FROM  
                                            (SELECT CAST(date_val AS DATE) as d1,
                                            CAST(LAG(date_val) OVER (ORDER BY date_of_occurance) AS DATE)  as d2
                            FROM(SELECT DISTINCT ON(date_of_occurance) date_of_occurance, LEFT(date_of_occurance::TEXT,10) as date_val
                            FROM reports.accident_report 
                            WHERE delete_status='false' AND changed_status='false' ${con}
                            ORDER BY date_of_occurance)A1)A2)A3`;

    const getBest = await fadb.query((sql_findBest));

    const bestCountEver = (getBest.rows.length > 0) ? getBest.rows[0].best_val : daysPassedSinceLastAccident;

    res.json({ bestCnt: bestCountEver, count: daysPassedSinceLastAccident });
})
/*------------------------------------------------*/
router.get('/prevData/:selMonth', async (req, res) => {
    try {
        const curDate = new Date().toLocaleDateString('ja-JP', {
            month: "2-digit",
            day: "2-digit",
        }).replace('/', '-')

        const curMonth = (req.params.selMonth != '') ? req.params.selMonth : new Date().toLocaleDateString('ja-JP', {
            month: "2-digit",
        })

        const thisYear = new Date().getFullYear();

        const sql = `SELECT LEFT(date_of_occurance::TEXT,4) AS year_of_occurance, accident_type, accident_code, leave_count
                        , accident_details, team_id, team_name, accident_location
                        , medical_report, remarks, entered_by, entry_time, changed_status, before_change_entry_id, delete_status
                    FROM reports.accident_report
                    WHERE delete_status='false' AND changed_status='false' 
                    --AND date_of_occurance::TEXT LIKE '%-${curDate}%' 
                    AND LPAD(EXTRACT(MONTH FROM date_of_occurance)::TEXT, '2', '0')='${curMonth}' 
                    AND LEFT(date_of_occurance::TEXT,4)<>'${thisYear}'
                    ORDER BY date_of_occurance DESC LIMIT 5`;

        const data = await fadb.query(sql);

        let result = null;

        if (data.rows.length > 0) {
            result = data.rows;
        }

        res.status(200).json({ data: result });

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
})
/*------------------------------------------------*/
export default router
//------------- Other functions ------------------//
const dayDifference = (secondDate) => {
    const date2 = new Date();
    const date1 = new Date(secondDate);

    // To calculate the time difference of two dates
    var Difference_In_Time = date2.getTime() - date1.getTime();

    // To calculate the no. of days between two dates
    var Difference_In_Days = Math.round(Math.abs(Difference_In_Time / (1000 * 3600 * 24)));

    return Difference_In_Days;
};
/*------------------------------------------------*/
async function fetchAccidentReport(dateVal, teamName) {
    let con = '';

    if (teamName != 'null' && teamName != "") {
        con = ` AND team_name='${teamName}'`;
    } else {
        // con = ` AND (team_name='PC' OR team_name='PP' OR team_name='FCS' OR team_name='RRO' OR team_name='RRA')`;
        con = `AND team_id<='20'`;
    }

    const selectDataSql = `SELECT entry_id, date_of_occurance, accident_type, accident_code, leave_count, accident_details
                , team_id, team_name, accident_location , medical_report, remarks, entered_by, entry_time, changed_status
                , before_change_entry_id, delete_status
            FROM reports.accident_report
            WHERE delete_status='false' AND changed_status='false'
            ${con}
            AND date_of_occurance::TEXT LIKE '${dateVal}%'`;

    const accidentData = await fadb.query(selectDataSql);

    let result = 0;

    if (accidentData.rows.length > 0) {
        result = accidentData.rows[0].accident_code;
    }
    return result;
}
/*------------------------------------------------*/