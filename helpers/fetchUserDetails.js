import { dtdb } from "../dbConfig.js";

const fetchUserDetails = async (userid) => {
    const sql = `SELECT CONCAT(last_name , ' ', first_name) as user_name
                    , user_id, password, first_name, last_name, employee_id, email_address, phone_number
                    , active_status, LEFT(registered_time::TEXT,10) as registered_time, last_updated_time
                FROM adm.user_details
               WHERE user_id=$1 AND active_status='true'`;

    const userData = await dtdb.query(sql, [userid]);

    return await userData.rows[0];
};

const fetchUserDeptList = async (userid) => {

    const sql2 = `SELECT * FROM (SELECT DISTINCT ON(t1.record_id) 
          t1.record_id, t1.department_id, t2.dept_name, t1.section_id,t3.section_name
          , t1.start_date, t1.end_date, LEFT(t1.created_on::TEXT,10) AS created_on ,t1.delete_status
          
          FROM adm.user_department_section t1
          LEFT JOIN adm.department_list t2 ON t1.department_id=t2.dept_id 
          LEFT JOIN adm.section_list t3 ON t1.section_id=t3.section_id 
          WHERE user_id=$1 )tbl WHERE delete_status='false'
          ORDER BY delete_status ASC, created_on DESC`;

    const deptData = await dtdb.query(sql2, [userid]);

    return deptData.rows;
}

const fetchUserRoleList = async (userid) => {
    const sql3 = `SELECT * FROM (SELECT DISTINCT ON (record_id) 
          t1.record_id, t1.user_id, t1.role_id, t2.role_name, t1.from_date
          , LEFT(t1.created_on::TEXT,10) AS created_on, t1. delete_status
          
          FROM adm.user_role t1
          LEFT JOIN adm.role_list t2 ON t1.role_id = t2.role_id
          WHERE user_id=$1)tbl WHERE delete_status='false'
          ORDER BY delete_status ASC , created_on DESC`;

    const roleData = await dtdb.query(sql3, [userid]);

    return roleData.rows;

}

export { fetchUserDetails, fetchUserDeptList, fetchUserRoleList };
