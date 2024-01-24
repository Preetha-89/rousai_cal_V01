import { fadb, dtdb } from "../dbConfig.js";

async function getUserAuthVal(req, res) {
    if (req.data.user_id) {
        const userID = req.data.user_id;
        const sql = `SELECT t1.user_id, first_name, last_name, employee_id, email_address, phone_number
        ,t2.role_id , t3.auth_value
        FROM adm.user_details t1 
        LEFT JOIN  adm.user_role t2 ON t1.user_id=t2.user_id
        LEFT JOIN adm.role_auth_values t3 ON t2.role_id=t3.role_id::text 
        WHERE user_id=$1`;

        const get = await dtdb.query(sql, [userID]);

        if (get.rows.length > 0) {
            return get.rows[0].auth_value;
        } else {
            return "NG";
        }
    }
}

function ifOP(req, res, next) {
    const userAuth = getUserAuthVal(req, res);
    if (userAuth === 10) {
        req.verify = 10;
        next();
    } else {
        req.verify = "NG";
        res.render("login", { message: "アクセスできません!!" });
    }
}

function ifShokucho(req, res, next) {
    const userAuth = getUserAuthVal(req, res);
    if (userAuth === 20) {
        req.verify = "OK";
        next();
    } else {
        req.verify = "NG";
        res.render("login", { message: "アクセスできません!!" });
    }
}

function ifStaff(req, res, next) {
    const userAuth = getUserAuthVal(req, res);
    if (userAuth === 30) {
        req.verify = 30;
        next();
    } else {
        req.verify = "NG";
        res.render("login", { message: "アクセスできません!!" });
    }
}

export { ifOP, ifShokucho, ifStaff };
