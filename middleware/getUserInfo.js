import { dtdb } from "../dbConfig.js";

async function getUserInfo(req, res, next) {
    if (req.data.user_id != "") {
        const userID = req.data.user_id;

        const sql_userDetails = `SELECT trim(first_name) AS first_name, TRIM(last_name) AS last_name
                      , trim(employee_id) AS employee_id 
                      FROM adm.user_details WHERE user_id=$1 AND active_status='true'`;

        const userDetails = await dtdb.query(sql_userDetails, [userID]); 

        if (userDetails.rows.length > 0) {
            req.userName = userDetails.rows[0].last_name + " " + userDetails.rows[0].first_name;

            const sql_userDept = `SELECT DISTINCT ON (dept_id) 
                            dept_id, trim(dept_name) AS dept_name, t1.section_id, trim(section_name) AS section_name, start_date
                            FROM adm.user_department_section t1 
                            LEFT JOIN adm.department_list t2 ON t1.department_id = t2.dept_id 
                            LEFT JOIN adm.section_list t3 ON t1.section_id = t3.section_id 
                            WHERE t1.delete_status='false' AND t1.user_id = $1`;

            const userDeptList = await dtdb.query(sql_userDept, [userID]);
            req.userDept = userDeptList.rows;

            const sql_userRole = `SELECT DISTINCT ON(role_id) 
                            t1.role_id, trim(role_name) AS role_name, role_auth_val, from_date 
                            FROM adm.user_role t1                         
                            LEFT JOIN adm.role_list t2 ON t1.role_id::text=t2.role_id::text 
                            WHERE t1.delete_status='false' AND t1.user_id = $1`;

            const userRoleList = await dtdb.query(sql_userRole, [userID]);

            req.userRole = userRoleList.rows;
            req.userId = userID;

            const userName = userDetails.rows[0].last_name + " " + userDetails.rows[0].first_name;
            const userId = userID;
            const userDept = userDeptList.rows;
            const userRole = userRoleList.rows;

            next();

        }  else{
                console.log('no user found')
        }
    }
}

export { getUserInfo };
