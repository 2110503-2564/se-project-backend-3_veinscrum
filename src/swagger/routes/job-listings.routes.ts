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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 25
 *         description: Number of items per page (use -1 for all items)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by (prefix with - for descending order)
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
 *                 count:
 *                   type: integer
 *                   description: Number of returned job listings
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
 *                           example: 25
 *                     prev:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobListing'
 *       400:
 *         description: Bad request - Invalid pagination parameters
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
 *         description: The job listing with populated company information and image field included (as base64 string)
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
 *                     - $ref: '#/components/schemas/JobListing'
 *                     - type: object
 *                       properties:
 *                         image:
 *                           type: string
 *                           format: byte
 *                           description: Base64 encoded image data
 *             example:
 *               success: true
 *               data:
 *                 id: "6056da561452242d88d36e37"
 *                 company:
 *                   _id: "8056da561123452d88d367be"
 *                   name: "Tech Company"
 *                   address: "123 Main St"
 *                   website: "https://example.com"
 *                   description: "A technology company"
 *                   tel: "0123456789"
 *                   owner: "7056da561123452d88d367bc"
 *                 jobTitle: "Software Engineer"
 *                 description: "Build great software"
 *                 createdAt: "2025-04-12"
 *                 image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
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
 *     summary: Create a new job listing (Company role only)
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
 *     summary: Get interview sessions by job listing (Admin or Company role only)
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
