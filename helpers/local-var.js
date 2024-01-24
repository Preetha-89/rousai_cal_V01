import moment from "moment-timezone";

const today = () => { return moment().format('Y-MM-DD'); }
const thisMonth = () => { return moment().format('Y-MM'); }
const timenow = () => { return moment().tz('Asia/Tokyo').format('Y-MM-D HH:mm:ss'); }
const datetimestamp = () => { return moment().tz('Asia/Tokyo').format('YMMDHHmmss'); }

export { today, thisMonth, timenow, datetimestamp }