
  try {

    const coachRepository = dataSource.getRepository('Coach');
    const coaches = await coachRepository
      .createQueryBuilder('coach')
      .leftJoinAndSelect('coach.User', 'user')
      .select([
        'coach.id',
        'coach.experience_years',
        'coach.description',
        'coach.profile_image_url',
        'user.name',
      ])
      .skip((pageNumber - 1) * perNumber)
      .take(perNumber)
      .getMany();

    res.status(200).json({
      status: 'success',
      data: coaches,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.get('/:coachId', async (req, res, next) => {
  try {
    const { coachId } = req.params;
    if (isUndefined(coachId) || isNotValidUuid(coachId)) {
      res.status(400).json({
        status: 'failed',
        message: 'ID 錯誤',
      });
      return;
    }
    const coachRepository = dataSource.getRepository('Coach');
    const coach = await coachRepository
      .createQueryBuilder('coach')
      .leftJoinAndSelect('coach.User', 'user')
      .select([
        'coach.id',
        'coach.experience_years',
        'coach.description',
        'coach.profile_image_url',
        'user.name',
      ])
      .where('coach.id = :id', { id: coachId })
      .getOne();

    res.status(200).json({
      status: 'success',
      data: coach,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
})
module.exports = router;