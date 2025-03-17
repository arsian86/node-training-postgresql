const express = require("express")
const router = express.Router()
const {dataSource} = require("../db/data-source")
const config = require("../config/index")
const logger = require("../utils/logger")("Admin")
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
})
const isCoach = require("../middlewares/isCoach")
const errorHandlerAsync = require("../utils/errorHandlerAsync")
const adminController = require("../controllers/admin")

//新增教練課程資料
router.post(
  "/coaches/courses",
  auth,
  isCoach,
  errorHandlerAsync(adminController.addCoachCourses)
)
//編輯教練課程資料
router.put(
  "/coaches/courses/:courseId",
  auth,
  isCoach,
  errorHandlerAsync(adminController.putCoachCourses)
)
//將使用者新增為教練
router.post(
  "/coaches/:userId",
  errorHandlerAsync(adminController.changeUsertoCoach)
)

module.exports = router
