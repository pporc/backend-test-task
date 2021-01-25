import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import passport from "passport";
import passportJWT from "passport-jwt";

import { createUser, getUser } from "../models/users.js";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
  getAllProduct,
} from "../models/products.js";

const router = Router();
const storage = multer.diskStorage({
  destination: "images/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

let ExtractJwt = passportJWT.ExtractJwt;

let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromExtractors([
  ExtractJwt.fromHeader("authorization"),
]);
jwtOptions.secretOrKey = "cleveroad test task";

let strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  console.log("payload received", jwt_payload);
  let user = getUser({ id: jwt_payload.id });
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

router.post("/api/register", (req, res) => {
  const data = Object.keys({ ...req.body });

  if (!data.includes("name")) {
    return res.status(422).json({
      field: "current_name",
      message: "Wrong current name",
    });
  } else if (!data.includes("password")) {
    return res.status(422).json({
      field: "current_password",
      message: "Wrong current password",
    });
  } else if (!data.includes("email")) {
    return res.status(422).json({
      field: "current_email",
      message: "Wrong current email",
    });
  }

  const { name, password, email, phone } = req.body;
  createUser({ name, password, email, phone }).then((user) => res.json(user));
});

router.post("/api/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
    let user = await getUser({ email });
    if (!user) {
      res.status(401).json({ msg: "No such user found", user });
    }
    if (user.password === password) {
      let payload = { id: user.id };
      let token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({ token: token });
    } else {
      res
        .status(422)
        .json({ field: "password", message: "Wrong email or password" });
    }
  }
});

router.get(
  "/api/me",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    req.user.then((val) => {
      const { id, name, phone, email } = val.dataValues;
      res.json({ id, phone, name, email });
    });
  }
);

router.post(
  "/api/items",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { title, price } = req.body;
    const user = await req.user.then((data) => {
      const userData = data.dataValues;
      delete userData.password;
      return userData;
    });

    if (title.length === 0)
      return res.status(422).json({
        field: "title",
        message: "Title is required",
      });

    if (price.length === 0)
      return res.status(422).json({
        field: "price",
        message: "Price is required",
      });

    createProduct({
      title,
      price,
      user_id: user.id,
    }).then((product) => res.json({ ...product.dataValues, user }));
  }
);

router.delete(
  "/api/items/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await req.user.then((user) => user);
    const product = await getProduct(req.params.id).then((prod) => prod);

    if (user.id !== product.user_id) return res.sendStatus(403);

    deleteProduct(req.params.id)
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(404));
  }
);

router.put(
  "/api/items/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await req.user.then((user) => user);
    const product = await getProduct(req.params.id).then((prod) => prod);
    console.log(user, product);
    if (req.body.title.length < 3)
      return res.status(422).json({
        field: "title",
        message: "Title should contain at least 3 characters",
      });

    if (user.id !== product.user_id) return res.sendStatus(403);

    updateProduct(req.params.id, req.body)
      .then(() =>
        getProduct(req.params.id).then((product) => res.json(product))
      )
      .catch(() => res.sendStatus(404));
  }
);

router.get("/api/items/:id", (req, res) => {
  getProduct(req.params.id)
    .then((product) =>
      getUser({ id: product.user_id }).then((user) => {
        const userInfo = user.dataValues;
        delete userInfo.password;
        res.json({ ...product.dataValues, user: userInfo });
      })
    )
    .catch(() => res.sendStatus(404));
});

router.get("/api/items/", (req, res) => {
  getAllProduct()
    .then((products) => {
      res.json([...products]);
    })
    .catch(() => res.sendStatus(404));
});

router.post(
  "/api/items/:id/images",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  (req, res) => {
    updateProduct(req.params.id, {
      image: `http://example.com/images/${req.file.filename}`,
    }).then(() =>
      getProduct(req.params.id).then((product) => res.json(product))
    );
  }
);

export default router;
