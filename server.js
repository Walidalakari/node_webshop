const express = require("express");
const multer = require("multer");
const app = express();
const db = require("./connection");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const session = require("express-session");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  session({
    secret: "xxxtentacion",
    resave: false,
    saveUninitialized: false,
  })
);

// Set up multer storage and upload middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/post", function (req, res) {
  res.render("post");
});

app.get("/signup", (req, res) => {
  const user = req.session.userID;
  res.render("signup", { user });
});

app.post("/signup", (req, res) => {
  const { name, email, password, sex } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: "Failed to hash password" });
    }

    // Insert the user into the database
    const user = {
      name,
      email,
      password: hashedPassword,
      sex,
    };
    db.query("INSERT INTO users SET ?", user, (error, results) => {
      if (error) {
        console.error("Failed to create user", error);
        return res.status(500).json({ error: "Failed to create user" });
      }
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.sex = user.sex;
      req.session.userEmail = user.email;

      res.redirect("/");
    });
  });
});

app.get("/signin", (req, res) => {
  const user = req.session.userID;
  res.render("signin", { user });
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  db.query("SELECT * FROM users WHERE email = ?", [email], (error, results) => {
    if (error) {
      console.error("Failed to fetch user", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    // Compare passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: "Failed to compare passwords" });
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Create sessions
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.sex = user.sex;
      req.session.userEmail = user.email;

      res.redirect("/");
    });
  });
});

const verify = (req, res, next) => {
  // Assuming you're using a session middleware such as 'express-session'
  if (req.session && req.session.userName) {
    next();
  } else {
    // User is not logged in, redirect to the sign-in page
    res.redirect("/signin");
  }
};

app.post("/p", upload.single("img"), function (req, res) {
  const Produkt = req.body.produkt;
  const beskrivning = req.body.beskrivning;
  const price = req.body.price;
  const kategorier = req.body.kategorier;
  const img = "/uploads/" + req.file.filename;
  const sqlInsert =
    "INSERT INTO produkterna (Produkt, kategorier, beskrivning, price, img) VALUES (?, ?, ?, ?, ?);";

  db.query(
    sqlInsert,
    [Produkt, kategorier, beskrivning, price, img],
    (err, result) => {
      if (err) {
        console.error("Error inserting into database: " + err.stack);
        return;
      }

      console.log("Inserted into database with ID: " + result.insertId);

      res.redirect("/");
    }
  );
});

app.get("/", verify, function (req, res) {
  db.query("SELECT * FROM produkterna", (err, results, fields) => {
    if (err) {
      console.error("Error querying database: " + err.stack);
      return;
    }
    const userId = req.session.userId;

    db.query(
      "SELECT * FROM users WHERE id = ?",
      [userId],
      (error, userResults) => {
        if (error) {
          console.error("Failed to fetch user", error);
          res.status(500).send("Failed to fetch user");
          return;
        }

        let user;
        if (userResults.length > 0) {
          user = userResults[0];
        } else {
          console.log("User not found");
        }

        console.log("USERID: ", userId, "user: ", user);
        res.render("index", {
          produkterna: results,
          user,
        });
      }
    );
  });
});

app.get("/jeans", verify, function (req, res) {
  db.query(
    "SELECT * FROM produkterna WHERE Kategorier='Jeans'",
    (err, results, fields) => {
      if (err) {
        console.error("Error querying database: " + err.stack);
        return;
      }
      const userId = req.session.userId;

      db.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
        (error, userResults) => {
          if (error) {
            console.error("Failed to fetch user", error);
            res.status(500).send("Failed to fetch user");
            return;
          }

          let user;
          if (userResults.length > 0) {
            user = userResults[0];
          } else {
            console.log("User not found");
          }

          console.log("USERID: ", userId, "user: ", user);
          res.render("index", {
            produkterna: results,
            user,
          });
        }
      );
    }
  );
});

app.get("/shirts", verify, function (req, res) {
  db.query(
    "SELECT * FROM produkterna WHERE Kategorier='Shirts'",
    (err, results, fields) => {
      if (err) {
        console.error("Error querying database: " + err.stack);
        return;
      }
      const userId = req.session.userId;

      db.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
        (error, userResults) => {
          if (error) {
            console.error("Failed to fetch user", error);
            res.status(500).send("Failed to fetch user");
            return;
          }

          let user;
          if (userResults.length > 0) {
            user = userResults[0];
          } else {
            console.log("User not found");
          }

          console.log("USERID: ", userId, "user: ", user);
          res.render("index", {
            produkterna: results,
            user,
          });
        }
      );
    }
  );
});

app.get("/jackets", verify, function (req, res) {
  db.query(
    "SELECT * FROM produkterna WHERE Kategorier='Jackets'",
    (err, results, fields) => {
      if (err) {
        console.error("Error querying database: " + err.stack);
        return;
      }
      const userId = req.session.userId;

      db.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
        (error, userResults) => {
          if (error) {
            console.error("Failed to fetch user", error);
            res.status(500).send("Failed to fetch user");
            return;
          }

          let user;
          if (userResults.length > 0) {
            user = userResults[0];
          } else {
            console.log("User not found");
          }

          console.log("USERID: ", userId, "user: ", user);
          res.render("index", {
            produkterna: results,
            user,
          });
        }
      );
    }
  );
});

// GET-rout för att visa kundvagnssidan
app.get("/cart", (req, res) => {
  // Här antar jag att du har en fungerande databasanslutning
  db.query("SELECT * FROM kundvagn", (err, result) => {
    if (err) {
      console.error("Error fetching products from cart:", err);
      res.sendStatus(500);
    } else {
      const produkterna = result;
      const user = req.session.userID;
      res.render("cart", { produkterna, user });
    }
  });
});

// POST-rout för att lägga till produkten i kundvagnen
app.post("/addToCart", (req, res) => {
  const { namn, pris } = req.body;

  // Skapa SQL-frågan för att infoga produkten i kundvagnstabellen
  const query = `INSERT INTO kundvagn (namn, pris) VALUES ('${namn}', '${pris}')`;

  // Utför SQL-frågan
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error adding product to cart:", err);
      return res.sendStatus(500);
    }
    console.log("Product added to cart:", result);
    return res.sendStatus(200);
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server, port 3000");
});
