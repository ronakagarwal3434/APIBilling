const Redis = require("ioredis");
const Queue = require("bull");

const redis = new Redis();
const RequestBillingQueue = new Queue("RequestBillingQueue");
const CronQueue = new Queue("CronQueue");
require("./config/database");

console.log("Worker A running ...");

var RequestBillingProvider = require("./providers/requestbilling/requestbilling_provider");
var CronProvider = require("./providers/cron/cron_provider");

RequestBillingQueue.process(async (job, jobDone) => {
    await RequestBillingProvider.process(job.data)
        .then(() => {
            jobDone();
        })
        .catch((err) => {
            console.log(err);
            jobDone();
        });

    console.log("RequestBillingQueue job processed");
    jobDone();
});

CronQueue.process(async (job, jobDone) => {
    await CronProvider.process(job.data)
        .then(() => {
            jobDone();
        })
        .catch((err) => {
            console.log(err);
            jobDone();
        });

    console.log("CronQueue job processed");
    jobDone();
});
