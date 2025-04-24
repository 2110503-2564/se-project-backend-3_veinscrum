/**
 * @swagger
 * tags:
 *   name: Flags
 *   description: The flag managing API
 */
/**
 * @swagger
 * /job-listings/{id}/flags:
 *   get:
 *     summary: Get the flags by job listing id (Company or Admin only)
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The job listing id
 *     responses:
 *       200:
 *         description: The flags by job listing id with populated user field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flag'
 *             example:
 *               success: true
 *               data:
 *                 _id: "8056da561123452d88d367be"
 *                 jobListing: "8056da561123452d88d367be"
 *                 user: "8056da561123452d88d367be"
 *       404:
 *         description: The job listing was not found
 */

/**
 * @swagger
 * /flags:
 *   post:
 *     summary: Create a flag (Company/admin role)
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobListing
 *               - user
 *             properties:
 *               jobListing:
 *                 type: string
 *                 description: Job listing id
 *               user:
 *                 type: string
 *                 description: User id
 *     responses:
 *       201:
 *         description: The flag was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Flag'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized - only users with 'company' role can create companies
 */
/**
 * @swagger
 * /flags/{id}:
 *   delete:
 *     summary: Remove the flag by id (Admin or Company owner only)
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flag id
 *     responses:
 *       200:
 *         description: The job listing was deleted
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
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to delete this company
 *       404:
 *         description: The company was not found
 */
