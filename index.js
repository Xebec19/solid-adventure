const express = require("express");
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const app = express();

const db = new JsonDB(new Config("MyDatabase", true, false, "/"));

app.get("/api", (req, res) => {
  const id = uuid.v4();
  try {
    const path = "/user/" + id;
    const temp_secret = speakeasy.generateSecret();
    db.push(path, { id, temp_secret });
    res.json({ id, secret: temp_secret });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
});

app.post("/api/verify", (req, res) => {
  const { token, userId } = req.body;
  try {
    const path = `/user/${userId}`;
    const user = db.getData(path);
    const { base32: secret } = user.temp_secret;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: userToken,
    });
    if (verified) {
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
      res.json({message:'Error finding user'})
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server running on ", PORT));
