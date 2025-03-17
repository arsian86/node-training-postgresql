const bcrypt = require("bcrypt")
const {dataSource} = require("../db/data-source")
const logger = require("../utils/logger")("Users")
const generateJWT = require("../utils/generateJWT")
const {
  isNotValidString,
  isUndefined,
  isNotValidUuid,
} = require("../utils/validators")
const appError = require("../utils/appError")
const config = require("../config/index")

const userController = {
  async getUsers(req, res, next) {
    const userRepository = dataSource.getRepository("User")
    const users = await userRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.name",
        "user.email",
        "user.role",
        "user.created_at",
        "user.updated_at",
      ])
      .getMany() //回傳多筆資料

    res.status(200).json({
      status: "success",
      data: users,
    })
  },
  async userSignUp(req, res, next) {
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
    const {name, email, password} = req.body
    if (
      isUndefined(name) ||
      isNotValidString(name) ||
      isUndefined(email) ||
      isNotValidString(email) ||
      isUndefined(password) ||
      isNotValidString(password)
    ) {
      logger.warn("欄位未填寫正確")
      return next(appError(400, "欄位未填寫正確"))
    }
    if (!passwordPattern.test(password)) {
      logger.warn(
        "建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
      )
      return next(
        appError(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        )
      )
    }
    const userRepository = dataSource.getRepository("User")
    const existingUser = await userRepository.findOne({
      where: {email},
    })

    if (existingUser) {
      logger.warn("建立使用者錯誤: Email 已被使用")
      return next(appError(409, "Email 已被使用"))
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    const newUser = userRepository.create({
      name,
      email,
      role: "USER",
      password: hashPassword,
    })

    const savedUser = await userRepository.save(newUser)
    logger.info("新建立的使用者ID:", savedUser.id)

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: savedUser.id,
          name: savedUser.name,
        },
      },
    })
  },
  async deleteUser(req, res, next) {
    const {userId} = req.params
    if (
      isUndefined(userId) ||
      isNotValidString(userId) ||
      isNotValidUuid(userId)
    ) {
      return next(appError(400, "ID錯誤"))
    }
    const result = await dataSource.getRepository("User").delete(userId)
    if (result.affected === 0) {
      return next(appError(400, "ID錯誤"))
    }
    res.status(200).json({
      status: "success",
      message: "刪除成功",
    })
  },
  async userlogin(req, res, next) {
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
    const {email, password} = req.body
    if (
      isUndefined(email) ||
      isNotValidString(email) ||
      isUndefined(password) ||
      isNotValidString(password)
    ) {
      logger.warn("欄位未填寫正確")
      return next(appError(400, "欄位未填寫正確"))
    }
    if (!passwordPattern.test(password)) {
      logger.warn(
        "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
      )
      return next(
        appError(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        )
      )
    }
    const userRepository = dataSource.getRepository("User")
    const existingUser = await userRepository.findOne({
      select: ["id", "name", "password"],
      where: {email},
    })

    if (!existingUser) {
      return next(appError(400, "使用者不存在或密碼輸入錯誤"))
    }
    logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
    const isMatch = await bcrypt.compare(password, existingUser.password)
    if (!isMatch) {
      return next(appError(400, "使用者不存在或密碼輸入錯誤"))
    }
    const token = await generateJWT(
      {
        id: existingUser.id,
      },
      config.get("secret.jwtSecret"),
      {
        expiresIn: `${config.get("secret.jwtExpiresDay")}`,
      }
    )

    res.status(201).json({
      status: "success",
      data: {
        token,
        user: {
          name: existingUser.name,
        },
      },
    })
  },
  async getUserProfile(req, res, next) {
    const {id} = req.user
    const userRepository = dataSource.getRepository("User")
    const user = await userRepository.findOne({
      select: ["name", "email"],
      where: {id},
    })
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    })
  },
  async updateUserProfile(req, res, next) {
    const {id} = req.user
    const {name} = req.body
    if (isUndefined(name) || isNotValidString(name)) {
      logger.warn("欄位未填寫正確")
      return next(appError(400, "欄位未填寫正確"))
    }
    const userRepository = dataSource.getRepository("User")
    const user = await userRepository.findOne({
      select: ["name"],
      where: {
        id,
      },
    })
    if (user.name === name) {
      return next(appError(400, "使用者名稱未變更"))
    }
    const updatedResult = await userRepository.update(
      {
        id,
        name: user.name,
      },
      {
        name,
      }
    )
    if (updatedResult.affected === 0) {
      return next(appError(400, "更新使用者資料失敗"))
    }
    const result = await userRepository.findOne({
      select: ["name"],
      where: {
        id,
      },
    })
    res.status(200).json({
      status: "success",
      data: {
        user: result,
      },
    })
  },
}

module.exports = userController
