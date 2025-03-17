const {dataSource} = require("../db/data-source")
const {
  isNotValidInteger,
  isNotValidString,
  isUndefined,
} = require("../utils/validators")
const appError = require("../utils/appError")

const creditPackageController = {
  async getPackages(req, res, next) {
    const packages = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price", "createdAt"],
    })
    res.status(200).json({
      status: "success",
      data: packages,
    })
  },
  async addPackage(req, res, next) {
    const {name, credit_amount, price} = req.body
    if (
      isUndefined(name) ||
      isNotValidString(name) ||
      isUndefined(credit_amount) ||
      isNotValidInteger(credit_amount) ||
      isUndefined(price) ||
      isNotValidInteger(price)
    ) {
      return next(appError(400, "欄位未填寫正確"))
    }
    //查詢資料是否重複
    const creditPackageRepo = await dataSource.getRepository("CreditPackage")
    const existPackage = await creditPackageRepo.find({
      where: {
        name,
      },
    })
    if (existPackage.length > 0) {
      return next(appError(409, "資料重複"))
    }
    //新增資料
    const newPackage = await creditPackageRepo.create({
      name,
      credit_amount,
      price,
    })
    const result = await creditPackageRepo.save(newPackage)
    res.status(200).json({
      status: "success",
      data: result,
    })
  },
  async buyPackage(req, res, next) {
    const {id} = req.user
    const {creditPackageId} = req.params
    const creditPackageRepo = dataSource.getRepository("CreditPackage")
    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId,
      },
    })
    if (!creditPackage) {
      return next(appError(400, "ID錯誤"))
    }
    const creditPurchaseRepo = dataSource.getRepository("CreditPurchase")
    const newPurchase = await creditPurchaseRepo.create({
      user_id: id,
      credit_package_id: creditPackageId,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
      purchaseAt: new Date().toISOString(),
    })
    await creditPurchaseRepo.save(newPurchase)
    res.status(200).json({
      status: "success",
      data: null,
    })
  },
  async deletePackage(req, res, next) {
    const packageId = req.url.split("/").pop()
    if (isUndefined(packageId) || isNotValidString(packageId)) {
      return next(appError(400, "欄位未填寫正確"))
    }
    const result = await dataSource
      .getRepository("CreditPackage")
      .delete(packageId)
    if (result.affected === 0) {
      return next(appError(400, "ID錯誤"))
    }
    res.status(200).json({
      status: "success",
      data: result,
    })
  },
}

module.exports = creditPackageController
