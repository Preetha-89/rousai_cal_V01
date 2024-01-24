import express from "express"
/*----------- Middlewares ---------*/
import { fadb } from "../dbConfig.js";
import { today, timenow, thisMonth } from "../helpers/local-var.js";
/*-----------------------------------------------*/

const router = express.Router();

/*------------------------------------------------*/
router.get("/", async (req, res) => {
    try {
        res.render('pages/jq/home');
    } catch (err) {
        res.status(500).send(err)
    }
});
/*------------------------------------------------*/
export default router