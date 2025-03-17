const express = require("express")
const router = express.Router()
const errorHandlerAsync = require("../utils/errorHandlerAsync")
const skillController = require("../controllers/skill")

//取得教練專長列表
router.get("/", errorHandlerAsync(skillController.getSkills))
//新增教練專長
router.post("/", errorHandlerAsync(skillController.postSkill))
//刪除教練專長
router.delete("/:skillId", errorHandlerAsync(skillController.deleteSkill))

module.exports = router
