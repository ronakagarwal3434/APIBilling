const Redis = require("ioredis");

const redis = new Redis();

class RequestBillingProvider {
    static async process(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { userid, month, year } = data;
                let queryStringForApiCalls = `${userid}_${month}_${year}_api_calls_count`;
                let queryStringForApiBills = `${userid}_${month}_${year}_api_cost_total`;
                await redis.incr(queryStringForApiCalls);
                await redis.incrbyfloat(queryStringForApiBills, 0.2);
                resolve();
            } catch (err) {
                console.log(err);
                reject("failed");
            }
        });
    }
}

module.exports = RequestBillingProvider;
