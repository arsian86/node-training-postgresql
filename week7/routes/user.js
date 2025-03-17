const express = require("express")
const router = express.Router()
const config = require("../config/index")
const {dataSource} = require("../db/data-source")
const logger = require("../utils/logger")("Users")
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
})
const userController = require("../controllers/user")
const errorHandlerAsync = require("../utils/errorHandlerAsync")
//取得使用者列表
router.get("/", errorHandlerAsync(userController.getUsers))
//使用者註冊
router.post("/signup", errorHandlerAsync(userController.userSignUp))
//刪除使用者
router.delete("/:userId", errorHandlerAsync(userController.deleteUser))
//使用者登入
router.post("/:userId", errorHandlerAsync(userController.userlogin))
//取得個人資料
router.get("/profile", auth, errorHandlerAsync(userController.getUserProfile))
//更新個人資料
router.put(
  "/profile",
  auth,
  errorHandlerAsync(userController.updateUserProfile)
)

module.exports = router
