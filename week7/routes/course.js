const express = require("express")
const router = express.Router()
const config = require("../config/index")
const {dataSource} = require("../db/data-source")
const logger = require("../utils/logger")("Course")
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
})
const errorHandlerAsync = require("../utils/errorHandlerAsync")
const courseController = require("../controllers/course")

//取得課程列表
router.get("/", errorHandlerAsync(courseController.getCourses))
//報名課程
router.post(
  "/:courseId",
  auth,
  errorHandlerAsync(courseController.signUpCourse)
)
//刪除課程
router.delete(
  "/:courseId",
  auth,
  errorHandlerAsync(courseController.deleteCourse)
)

module.exports = router
