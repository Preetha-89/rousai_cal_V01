import express from "express"
import fetch from "node-fetch";
/*----------- Middlewares ---------*/
import { verifyToken } from "../middleware/verifyToken.js";
import { getUserInfo } from "../middleware/getUserInfo.js";
/*---------------------------------*/
import { fetchUserDetails } from "../helpers/fetchUserDetails.js";
import fetchTeamList from "../helpers/fetchTeamList.js";
/*---------------------------------*/
const router = express.Router();

/*------------------------------------------------*/

router.get("/", async (req, res) => {
    res.render('welcome', { url: "plus-cal/hw-cal" });
});

/*------------------------------------------------*/

router.get("/login", async (req, res) => {
    if (!req.cookies.userToken || req.cookies.userToken == "") {
        res.render("login", { title: "災害情報" });
    } else {
        res.render('welcome', { url: "pages/dashboard" });
    }
});

/*------------------------------------------------*/

router.post("/login", async (req, res) => {
    const id = req.body.user_id;
    const password = req.body.password;
    const data = { id: id, password: password };
    const url = `${process.env.LOGIN_SYS}auth/login`;

    const dt = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });

    const response = await dt.json(); 

    if (response.accessToken) {
        res.cookie("userToken", response.accessToken); 

        const userDetails = await fetchUserDetails(id); 

        res.render('welcome', { url: "pages/dashboard" });
    } else {
        res.render("login", {
            message: "ユーザーID 又はパスワードは間違っています！",
        });
    }
});

/*------------------------------------------------*/

router.get("/pages/dashboard", verifyToken, getUserInfo, async (req, res) => {

    if (!req.cookies.userToken || req.cookies.userToken == "") {
        res.render("login", { title: "災害情報" });
    } else {
        const teamList = await fetchTeamList();
        res.render('pages/dashboard', {
            userName: req.userName,
            teams: teamList
        });
    }
});

/*------------------------------------------------*/
router.get("/logout", async (req, res) => {
    const url = `${process.env.LOGIN_SYS}auth/logout`;
    
    const saveLog = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer: " + req.cookies.userToken,
        },
    });

    const save = await saveLog.json();

    res.clearCookie("userToken");
    res.redirect("/");
});
/*------------------------------------------------*/

export default router
