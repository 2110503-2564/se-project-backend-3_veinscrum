/**
 * @swagger
 * tags:
 *   name: Job Listings
 *   description: The job listing managing API
 */

/**
 * @swagger
 * /job-listings:
 *   get:
 *     summary: Returns the list of all the job listings
 *     tags: [Job Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the job listings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobListing'
 */

/**
 * @swagger
 * /job-listings/{id}:
 *   get:
 *     summary: Get the job listing by id
 *     tags: [Job Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The job listing id
 *     responses:
 *       200:
 *         description: The job listing description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobListing'
 *       404:
 *         description: The job listing was not found
 */

/**
 * @swagger
 * /job-listings:
 *   post:
 *     summary: Create a new job listing
 *     tags: [Job Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobListing'
 *     responses:
 *       201:
 *         description: The job listing was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobListing'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /job-listings/{id}:
 *   put:
 *     summary: Update the job listing by the id
 *     tags: [Job Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The job listing id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobListing'
 *     responses:
 *       200:
 *         description: The job listing was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobListing'
 *       404:
 *         description: The job listing was not found
 *       500:
 *         description: Some error happened
 */

/**
 * @swagger
 * /job-listings/{id}:
 *   delete:
 *     summary: Remove the job listing by id
 *     tags: [Job Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The job listing id
 *
 *     responses:
 *       200:
 *         description: The job listing was deleted
 *       404:
 *         description: The job listing was not found
 */

/**
 * @swagger
 * /job-listings/{id}/sessions:
 *   get:
 *     summary: Get interview sessions by job listing
 *     tags: [Job Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The job listing id
 *
 *     responses:
 *       200:
 *         description: List of interview sessions for this job listing
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InterviewSession'
 *       404:
 *         description: The job listing was not found
 */
