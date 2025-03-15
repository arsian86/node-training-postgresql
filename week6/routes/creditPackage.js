const express = require('express')
const config = require('../config/index')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const {isNotValidInteger,isNotValidString,isUndefined} = require('../utils/validators')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})

router.get('/', async (req, res, next) => {
    try {
        const packages = await dataSource.getRepository("CreditPackage").find({
          select: ["id", "name", "credit_amount", "price","createdAt"]
        })
        res.status(200).json({
          status: 'success',
          data: packages
        })
    }catch (error) {
        logger.error(error)
        next(error)
      }
})
router.post('/', async (req, res, next) => {
        try {
          const {name,credit_amount,price} = req.body
          if (isUndefined(name) || isNotValidString(name) ||
                  isUndefined(credit_amount) || isNotValidInteger(credit_amount) ||
                  isUndefined(price) || isNotValidInteger(price)) {
            res.status(400).json({
              status: "failed",
              message: "欄位未填寫正確"
            })
            return
          }
          //查詢資料是否重複
          const creditPackageRepo = await dataSource.getRepository("CreditPackage")
          const existPackage = await creditPackageRepo.find({
            where: {
              name
            }
          })
          if (existPackage.length > 0) {
            res.status(409).json({
                status: 'failed',
                message: '資料重複'
              })
            return
          }
          //新增資料
          const newPackage = await creditPackageRepo.create({
            name,
            credit_amount,
            price
          })
          const result = await creditPackageRepo.save(newPackage)
          res.status(200).json({
            status: 'success',
            data: result
          })
        } catch (error) {
            logger.error(error)
            next(error)
        }
})
router.post('/:creditPackageId', auth, async (req, res, next) => {
  try {
    const { id } = req.user
    const { creditPackageId } = req.params
    const creditPackageRepo = dataSource.getRepository('CreditPackage')
    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId
      }
    })
    if (!creditPackage) {
      res.status(400).json({
        status: 'failed',
        message: 'ID錯誤'
      })
      return
    }
    const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
    const newPurchase = await creditPurchaseRepo.create({
      user_id: id,
      credit_package_id: creditPackageId,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
      purchaseAt: new Date().toISOString()
    })
    await creditPurchaseRepo.save(newPurchase)
    res.status(200).json({
      status: 'success',
      data: null
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})
router.delete('/:creditPackageId', async (req, res, next) => {
    try {
        const packageId = req.url.split("/").pop()
        if (isUndefined(packageId) || isNotValidString(packageId)) {
            res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
          })
          return
        }
        const result = await dataSource.getRepository("CreditPackage").delete(packageId)
        if (result.affected === 0) {
          res.status(400).json({
            status: "failed",
            message: "ID錯誤"
          })
          return
        }
        res.status(200).json({
            status: 'success',
            data: result
          })
        res.end()
    } catch (error) {
        logger.error(error)
        next(error)
      }
})

module.exports = router
