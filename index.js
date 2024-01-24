#!/usr/bin/env node
import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
/*-- ROUTES :START --*/
import topRoutes from "./routes/top-routes.js";
import plusCalendarRoutes from "./routes/plus-cal-routes.js";
import JqRoutes from "./routes/jq-routes.js";
import adminRoutes from "./routes/admin-routes.js";

/*-- ROUTES : END --*/

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = { credentials: true, origin: process.env.URL || "*" };

app.use(cors(corsOptions));
app.use(json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

/* KEEP STATIC FILES IN PUBLIC FOLDER */
app.use("/", express.static(join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.siteTitle = '工程日報システム',
        res.locals.userId = req.userId,
        res.locals.userName = req.userName,
        res.locals.userDept = req.userDept,
        res.locals.userRole = req.userRole
    next()
})
app.use("/", topRoutes);
app.use("/plus-cal", plusCalendarRoutes);
app.use("/jq", JqRoutes);
app.use("/admin", adminRoutes);

/* Start : Special pages */
app.use(function (req, res, next) {
    res.status(404).render("pages/404");
});
app.use(function (req, res, next) {
    res.status(500).render("pages/500");
});
/* End : Special pages */

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
