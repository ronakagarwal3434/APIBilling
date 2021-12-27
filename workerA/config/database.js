const mongoose = require("mongoose");
var url = "mongodb://127.0.0.1:27017/APIBilling";

mongoose
    .connect(url, {
        useNewUrlParser: true,
        autoIndex: true,
    })
    .then(() => console.log("DB Connected!"))
    .catch((err) => console.log("DB connection error", err));
