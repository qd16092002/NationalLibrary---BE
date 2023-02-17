const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/turorial.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Tạo model User
const User = mongoose.model("User", {
  username: {
    type: String,
    unique: true,
  },
  password: String,
  cccd: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  birthday: {
    type: Date,
  },
  gender: {
    type: String,
  },
  name: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
  },
  codeStudent: {
    type: String,
    unique: true,
  },
});
// Đăng ký tài khoản
app.post("/register", async (req, res) => {
  try {
    const {
      username,
      password,
      cccd,
      name,
      email,
      birthday,
      gender,
      phone,
      codeStudent,
    } = req.body;

    // Kiểm tra username đã được sử dụng chưa
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).send("username đã được sử dụng");
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Tạo tài khoản mới
    const newUser = new User({
      username,
      password: hash,
      name,
      cccd,
      email,
      birthday,
      gender,
      phone,
      codeStudent,
    });

    // Lưu vào cơ sở dữ liệu
    const insert = await newUser.save();

    // Trả về token cho client
    const token = jwt.sign({ username }, "mysecretkey");
    return res.json("Thanhf cong");
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});
// Đăng nhập
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send("username hoặc mật khẩu không đúng");
    }

    // Kiểm tra mật khẩu
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send("username hoặc mật khẩu không đúng");
    }

    // Trả về token cho client
    const token = jwt.sign({ username }, "mysecretkey");
    res.send({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});
//Cập nhật thông tin của user
app.put("/users/:codeStudent", (req, res) => {
  const userId = req.params.codeStudent; // Lấy id từ URL
  const { name, cccd, email, birthday, gender, phone } = req.body; // Lấy thông tin người dùng từ request body

  // Cập nhật thông tin người dùng trong CSDL
  User.updateOne(
    { codeStudent: userId },
    { name, cccd, email, birthday, gender, phone }
  )
    .then(() => {
      res.status(200).json({ message: "Update user successfully" });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});
