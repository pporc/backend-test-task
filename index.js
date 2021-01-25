import express from "express";
import passport from "passport";
import serverRoutes from "./routes/servers.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.json());

app.use(passport.initialize());

app.use(serverRoutes);

app.listen(PORT, () => {
  console.log(`server has been started on port ${PORT}...`);
});
