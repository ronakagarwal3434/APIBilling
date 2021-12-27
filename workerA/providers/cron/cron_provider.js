const Redis = require("ioredis");
const redis = new Redis();
const API = require("../../models/api");

class CronProvider {
    static async process(data) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(data);
                console.log("CronProvider hit!");
                let keys = [];
                let jsonObjects = {};
                var stream = redis.scanStream({
                    match: "*_api_cost_total",
                });
                stream.on("data", function (resultKeys) {
                    // `keys` is an array of strings representing key names
                    if (resultKeys.length) {
                        for (let i = 0; i < resultKeys.length; i++) {
                            keys.push(resultKeys[i]);
                        }
                    }
                    // console.log("ON => ", resultKeys);
                });
                stream.on("end", async function () {
                    for (var key of keys) {
                        jsonObjects[key] = await redis.getset(key, 0);
                        console.log(jsonObjects[key]);
                        // Update in mongodb
                        if (jsonObjects[key]) {
                            let tapi = await API.findOne({
                                UserId: key.substring(0, key.length - 23),
                            });
                            tapi.apiCount += jsonObjects[key];
                            await tapi.save();
                        }
                    }
                    console.log("done");
                });
                resolve();
            } catch (err) {
                console.log(err);
                reject("failed");
            }
        });
    }
}

module.exports = CronProvider;
