const express = require('express')
const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coach')
const {isNotValidUuid} = require('../utils/validators')
//取得教練列表
router.get('/', async (req, res, next) => {
  try {
    const perNum = parseInt(req.query.per) || 10;//parseInt失敗會回傳NaN
    const pageNum = parseInt(req.query.page) || 1;
    //在 JavaScript 中，如果一個變數是 undefined，使用 isNaN() 或者檢查字串時，JavaScript 自然會處理掉 undefined 的情況。
    if (pageNum<1 || perNum<1 ){
        res.status(400).json({
            status: 'failed',
            message: '頁碼或每頁顯示資料數錯誤'
        })
        return
    }
    const coachRepository = dataSource.getRepository('Coach'); 
    const coaches = await coachRepository
        .createQueryBuilder('coach')
        .take(perNum)
        .skip((pageNum - 1) * perNum)
        // 將 coach 與其關聯的 User 做 left join，並給 User 取別名 'user'
        .leftJoinAndSelect('coach.User', 'user')
        .select([
            'coach.id',
            'user.name'])
        .getMany()//回傳多筆資料

    res.status(200).json({
        status: "success",
        data: coaches
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

//取得教練詳細資訊
router.get('/:coachId', async (req, res, next) => {
    try {
      const { coachId } = req.params
      if(isNotValidUuid(coachId)){ //若為undefined,isNotValidString也會成立，檢查後者即可
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      const coachRepository = dataSource.getRepository('Coach');
      const coach = await coachRepository.findOne({
        where: { id: coachId },
        relations: ['User'] // 自動進行 JOIN
      });
      //!coach：null、undefined、false、0、NaN
      //查詢多筆資料的話，使用.length來檢查
      if (!coach) {
        return res.status(400).json({
          status: 'failed',
          message: '找不到該教練',
        });
      }
      const responseData = {
        user: {
          user_id: coach.User_id,
          name: coach.User.name,
          role: coach.User.role
        },
        coach: {
          id: coach.id,
          experience_years: coach.experience_years,
          description: coach.description,
          profile_image_url: coach.profile_image_url,
          created_at: coach.created_at,
          updated_at: coach.updated_at
        }
      };
  
      return res.status(200).json({
        status: 'success',
        data: responseData
      });
    } catch (error) {
      logger.error(error)
      next(error)
    }
  })
module.exports = router
