const appError = require("../utils/appError")
const {dataSource} = require("../db/data-source")
const {
  isNotValidUuid,
  isUndefined,
  isNotValidString,
} = require("../utils/validators")

const coachController = {
  async getCoaches(req, res, next) {
    const perNum = parseInt(req.query.per) || 10 //parseInt失敗會回傳NaN
    const pageNum = parseInt(req.query.page) || 1
    //在 JavaScript 中，如果一個變數是 undefined，使用 isNaN() 或者檢查字串時，JavaScript 自然會處理掉 undefined 的情況。
    if (pageNum < 1 || perNum < 1) {
      return next(appError(400, "頁碼或每頁顯示資料數錯誤"))
    }
    const coachRepository = dataSource.getRepository("Coach")
    const coaches = await coachRepository
      .createQueryBuilder("coach")
      .take(perNum)
      .skip((pageNum - 1) * perNum)
      // 將 coach 與其關聯的 User 做 left join，並給 User 取別名 'user'
      .leftJoinAndSelect("coach.User", "user")
      .select(["coach.id", "user.name"])
      .getMany() //回傳多筆資料

    res.status(200).json({
      status: "success",
      data: coaches,
    })
  },
  async getCoachDetails(req, res, next) {
    const {coachId} = req.params
    if (isNotValidUuid(coachId)) {
      //若為undefined,isNotValidString也會成立，檢查後者即可
      return next(appError(400, "欄位未填寫正確"))
    }
    const coachRepository = dataSource.getRepository("Coach")
    const coach = await coachRepository.findOne({
      where: {id: coachId},
      relations: ["User"], // 自動進行 JOIN
    })
    //!coach：null、undefined、false、0、NaN
    //查詢多筆資料的話，使用.length來檢查
    if (!coach) {
      return next(appError(400, "找不到該教練"))
    }
    const responseData = {
      user: {
        user_id: coach.User_id,
        name: coach.User.name,
        role: coach.User.role,
      },
      coach: {
        id: coach.id,
        experience_years: coach.experience_years,
        description: coach.description,
        profile_image_url: coach.profile_image_url,
        created_at: coach.created_at,
        updated_at: coach.updated_at,
      },
    }
    return res.status(200).json({
      status: "success",
      data: responseData,
    })
  },
  async getCoachCourses(req, res, next) {
    const {coachId} = req.params
    if (
      isUndefined(coachId) ||
      isNotValidUuid(coachId) ||
      isNotValidString(coachId)
    ) {
      return next(appError(400, "欄位未填寫正確"))
    }
    const coach = await dataSource.getRepository("Coach").findOne({
      select: {
        id: true,
        user_id: true,
        User: {
          name: true,
        },
      },
      where: {
        id: coachId,
      },
      relations: {
        User: true,
      },
    })
    if (!coach) {
      return next(appError(400, "找不到該教練"))
    }
    const courses = await dataSource.getRepository("Course").find({
      select: {
        id: true,
        name: true,
        description: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        Skill: {
          name: true,
        },
      },
      where: {
        user_id: coach.user_id,
      },
      relations: {
        Skill: true,
      },
    })
    res.status(200).json({
      status: "success",
      data: courses.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants: course.max_participants,
        coach_name: coach.User.name,
        skill_name: course.Skill.name,
      })),
    })
  },
}

module.exports = coachController
