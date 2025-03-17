const express = require("express")
const router = express.Router()
const creditPackageController = require("../controllers/creditPackage")
const config = require("../config/index")
const {dataSource} = require("../db/data-source")
const logger = require("../utils/logger")("CreditPackage")
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
})
const errorHandlerAsync = require("../utils/errorHandlerAsync")

//取得購買方案列表
router.get("/", errorHandlerAsync(creditPackageController.getPackages))
//新增購買方案列表
router.post("/", errorHandlerAsync(creditPackageController.addPackage))

//使用者購買方案
router.post(
  "/:creditPackageId",
  auth,
  errorHandlerAsync(creditPackageController.buyPackage)
)
//刪除購買方案
router.delete(
  "/:creditPackageId",
  errorHandlerAsync(creditPackageController.deletePackage)
)

module.exports = router
