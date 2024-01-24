import { fadb } from "../dbConfig.js";

const fetchTeamList = async () => {
    const teamList = await fadb.query(`SELECT team_id, team_name FROM reports.team_list_for_reports`);
    return teamList.rows;
}

export default fetchTeamList;