import { fadb, dtdb } from "../dbConfig.js"
import { today } from "./local-var.js";

const fetchUserSystemAuth = async (userId) => {
    let result = null;

    const sql = `SELECT user_id, t1.system_id, auth_val, t2.system_name, t2.system_link, t1.auth_val
                    FROM adm.userwise_system_access t1
                    LEFT JOIN adm.system_list t2 ON t1.system_id = t2.system_id::text
                    WHERE user_id='${userId}'`;

    const get = await dtdb.query(sql)

    if (get.rows.length > 0) {
        result = get.rows;
    }

    return result
}

export default fetchUserSystemAuth