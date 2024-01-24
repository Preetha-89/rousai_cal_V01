import fetch from "node-fetch";

async function verifyToken(req, res, next) {

    const token = req.cookies.userToken;
    const url = `${process.env.LOGIN_SYS}auth/verify`;

    const result = await fetch(url, {
        headers: {
            authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
    });

    const userInfo = await result.json();

    if (!userInfo.error) {
        
        req.data = userInfo;
        next();

    } else {
        res.render("login", { message: "Session expired" });
    }
}

export { verifyToken };
