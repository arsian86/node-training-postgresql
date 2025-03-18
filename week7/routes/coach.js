const express = require("express")
const router = express.Router()
const errorHandlerAsync = require("../utils/errorHandlerAsync")
const coachController = require("../controllers/coach")

//取得教練列表
router.get("/", errorHandlerAsync(coachController.getCoaches))

//取得教練詳細資訊
router.get("/:coachId", errorHandlerAsync(coachController.getCoachDetails))

//取得指定教練課程列表
router.get(
  "/:coachId/courses",
  errorHandlerAsync(coachController.getCoachCourses)
)

module.exports = router
