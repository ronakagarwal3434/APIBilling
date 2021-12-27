const express = require("express");
const proxy = require("express-http-proxy");
const Redis = require("ioredis");
const Queue = require("bull");

const app = express();
require("./config/database");

const redis = new Redis();
const RequestBillingQueue = new Queue("RequestBillingQueue");
const CronQueue = new Queue("CronQueue");

const API = require("./models/api");

app.use(
    "/external/*",
    proxy("http://localhost:3000", {
        proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
            let now = new Date();
            proxyReqOpts.headers["month"] = now.getMonth() + 1;
            proxyReqOpts.headers["year"] = now.getFullYear();
            return proxyReqOpts;
        },
        userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
            if (proxyRes.statusCode == "200") {
                data = JSON.parse(proxyResData.toString("utf8"));
                RequestBillingQueue.add(data.headers, {});
            }
            return proxyResData;
        },
    })
);

app.get("/billing", async (req, res) => {
    try {
        const { userid } = req.headers;
        let now = new Date();
        let month = now.getMonth() + 1;
        let year = now.getFullYear();
        let queryStringForApiCalls = `${userid}_${month}_${year}_api_calls_count`;
        let queryStringForApiBills = `${userid}_${month}_${year}_api_cost_total`;
        const APICalls = await redis.get(queryStringForApiCalls);
        const APIBills = await redis.get(queryStringForApiBills);
        const data = { APICalls: 0, APIBills: 0 };
        if (APICalls) data.APICalls = APICalls;
        if (APIBills) data.APIBills = APIBills;
        res.json(data);
    } catch (err) {
        console.log(err);
        res.sendStatus(500).send("Try Again");
    }
});

app.get("/signup", async (req, res) => {
    try {
        const api = new API({ UserId: req.headers.userid });
        await api.save();
        await CronQueue.add(
            {
                UserId: req.headers.userId,
            },
            {
                jobId: req.headers.userId,
                repeat: {
                    cron: "0 * * ? * *",
                },
            }
        );
        res.json(api);
        // await CronQueue.getRepeatableJobs().then(function (jobs) {
        //     console.log(jobs);
        //     jobs.forEach(async function (job) {
        //         await CronQueue.removeRepeatable(CronQueue, {
        //             repeat: { cron: job.cron },
        //         });
        //     });
        // });
        // res.json({ ok: true });
    } catch (err) {
        console.log(err);
        res.sendStatus(500).send("Try Again");
    }
});

app.listen(3001, () =>
    console.log("Server B (Proxy Sercer) is running on port 3001")
);
