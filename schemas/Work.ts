/**
 * @swagger
 * components:
 *   schemas:
 *     Work:
 *       type: object
 *       description: 'Описание одной выполненной работы и ее стоимости.'
 *       properties:
 *         name:
 *           type: string
 *           description: 'Название или описание работы.'
 *           example: 'Разработка логотипа'
 *         cost:
 *           type: number
 *           format: float
 *           description: 'Стоимость работы.'
 *           example: 150
 *       required:
 *         - name
 *         - cost
 */