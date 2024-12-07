const express = require("express");
const dotenv = require("dotenv");
const { syncDatabase } = require("./database");
const routes = require("./routes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "...server running..." });
});

app.use("/api", routes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
module.exports = app;
