const mongoose = require("mongoose");

const apiBody = {
    UserId: {
        type: String,
        unique: true,
    },
    apiCount: {
        type: Number,
        default: 0,
    },
};

const apiSchema = mongoose.Schema(apiBody, { timestamps: true });

const API = mongoose.model("API", apiSchema);
module.exports = API;
