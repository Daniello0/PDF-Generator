/**
 * @swagger
 * components:
 *   schemas:
 *     InvoiceRequest:
 *       type: object
 *       description: 'Данные, необходимые для создания счета.'
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 'Email клиента, на который будет отправлен счет.'
 *           example: 'daniilreserve@gmail.com'
 *         works:
 *           type: array
 *           description: 'Список выполненных работ.'
 *           items:
 *             $ref: '#/components/schemas/Work'
 *       required:
 *         - email
 *         - works
*/