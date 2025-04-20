/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: The company managing API
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Returns the list of all the companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: The list of companies (can be empty array if no companies exist)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     next:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 2
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                     prev:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *       400:
 *         description: Invalid pagination parameters
 */
/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get the company by id
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company id
 *     responses:
 *       200:
 *         description: The company description by id with populated logo field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Company'
 *                     - type: object
 *                       properties:
 *                         logo:
 *                           type: string
 *                           format: byte
 *                           description: Base64 encoded logo image data
 *             example:
 *               success: true
 *               data:
 *                 _id: "8056da561123452d88d367be"
 *                 name: "Tech Company"
 *                 address: "123 Main St"
 *                 website: "https://example.com"
 *                 description: "A technology company"
 *                 tel: "0123456789"
 *                 owner: "7056da561123452d88d367bc"
 *                 logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
 *       404:
 *         description: The company was not found
 */

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company (Company role only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - description
 *               - tel
 *             properties:
 *               name:
 *                 type: string
 *                 description: Company name
 *               address:
 *                 type: string
 *                 description: Company address
 *               website:
 *                 type: string
 *                 description: Company website
 *               description:
 *                 type: string
 *                 description: Company description
 *               tel:
 *                 type: string
 *                 description: Company telephone
 *     responses:
 *       201:
 *         description: The company was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized - only users with 'company' role can create companies
 */

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Update the company by the id
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: The company was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: The company was not found
 *       500:
 *         description: Some error happened
 */

/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Remove the company by id
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company id
 *     responses:
 *       200:
 *         description: The company was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       404:
 *         description: The company was not found
 */
