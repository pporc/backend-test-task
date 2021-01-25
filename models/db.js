import config from "config";
import { Sequelize } from "sequelize";

const dbConfig = config.get("dbConfig");

const sequelize = new Sequelize({
  ...dbConfig,
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully."))
  .catch((err) => console.error("Unable to connect to the database:", err));

export const User = sequelize.define(
  "users",
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.INTEGER,
    },
  },
  { timestamps: false }
);

export const Products = sequelize.define(
  "products",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    created_at: { type: Sequelize.DATE },
    title: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.INTEGER, allowNull: false },
    user_id: { type: Sequelize.INTEGER, allowNull: false },
    image: { type: Sequelize.STRING },
  },
  { timestamps: false }
);
