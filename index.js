const express = require("express");
const { connect } = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Importing routes
const clientRoutes = require("./Routes/ClientRoutes");
const tripRoutes = require("./Routes/TripRoutes");
const userRoutes = require("./Routes/UserRoutes");
const invoiceRoutes = require("./Routes/InvoiceRoutes");
const accommodationRoutes = require("./Routes/AccommodationRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/clients", clientRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/accommodations", accommodationRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(
    `Sada AlHikma app listening in ${process.env.NODE_ENV} on port ${PORT}!`
  );
});
