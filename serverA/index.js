const express = require("express");

const app = express();

app.get("*", (req, res) => {
    const { userid, month, year } = req.headers;
    res.json({
        headers: { userid, month, year },
        message: "Hello World",
    });
});

app.listen(3000, () => console.log("Server A is running on port 3000"));
