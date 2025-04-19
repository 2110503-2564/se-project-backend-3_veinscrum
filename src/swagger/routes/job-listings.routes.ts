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
 *     summary: Returns the list of all the job listings (Admin only)
 *     tags: [Job Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of all job listings with populated company data
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
 *                     $ref: '#/components/schemas/JobListing'
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to access this resource
 */

/**
 * @swagger
 * /job-listings/{id}:
 *   get:
 *     summary: Get the job listing by id (Public)
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
 *         description: The job listing with populated company information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/JobListing'
 *       404:
 *         description: The job listing was not found
 */

/**
 * @swagger
 * /companies/{id}/job-listings:
 *   get:
 *     summary: Get job listings by company (Company owner or admin only)
 *     tags: [Job Listings, Companies]
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
 *         description: The list of job listings for this company with populated company data
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
 *                     $ref: '#/components/schemas/JobListing'
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to view this company's job listings
 *       404:
 *         description: Company not found or no job listings found for this company
 */

/**
 * @swagger
 * /job-listings:
 *   post:
 *     summary: Create a new job listing (Admin or Company role only)
 *     tags: [Job Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company
 *               - jobTitle
 *               - description
 *             properties:
 *               company:
 *                 type: string
 *                 description: ID of the company
 *                 example: 8056da561123452d88d367be
 *               jobTitle:
 *                 type: string
 *                 description: Title of the job
 *                 example: "Software Developer"
 *               description:
 *                 type: string
 *                 description: Job description
 *                 example: "We are looking for a skilled software developer"
 *               image:
 *                 type: string
 *                 description: URL of the job image
 *                 example: "https://example.com/job.jpg"
 *     responses:
 *       201:
 *         description: The job listing was successfully created with populated company data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/JobListing'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to create job listings
 */

/**
 * @swagger
 * /job-listings/{id}:
 *   put:
 *     summary: Update a job listing (Admin or Company owner only)
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
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 description: Title of the job
 *                 example: "Updated Job Title"
 *               description:
 *                 type: string
 *                 description: Job description
 *                 example: "Updated job description with more details"
 *               image:
 *                 type: string
 *                 description: URL of the job image
 *                 example: "https://example.com/updated-job.jpg"
 *     responses:
 *       200:
 *         description: The job listing was updated with populated company data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/JobListing'
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to update this job listing
 *       404:
 *         description: The job listing was not found
 */

/**
 * @swagger
 * /job-listings/{id}:
 *   delete:
 *     summary: Delete a job listing (Admin or Company owner only)
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
 *     responses:
 *       200:
 *         description: The job listing was deleted along with associated interview sessions
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
 *         description: Forbidden - Not authorized to delete this job listing
 *       404:
 *         description: The job listing was not found
 */

/**
 * @swagger
 * /job-listings/{id}/sessions:
 *   get:
 *     summary: Get interview sessions by job listing (Authenticated users only)
 *     tags: [Job Listings, Interview Sessions]
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
 *         description: List of interview sessions for this job listing
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
 *                     $ref: '#/components/schemas/InterviewSession'
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to view these sessions
 *       404:
 *         description: The job listing was not found
 */
