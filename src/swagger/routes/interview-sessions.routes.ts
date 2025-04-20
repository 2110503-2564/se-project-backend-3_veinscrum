/**
 * @swagger
 * tags:
 *   name: Interview Sessions
 *   description: The session managing API
 */
/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Returns the list of all the sessions (Admin sees all, users see only their own)
 *     tags: [Interview Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by (prefix with - for descending order)
 *     responses:
 *       200:
 *         description: The list of the sessions with populated data
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
 *                   description: Number of returned sessions
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InterviewSession'
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to view these sessions
 */
/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Update a session (User who created, company owner, or admin)
 *     tags: [Interview Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The session id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Interview date and time (Must be between May 10-13, 2022)
 *                 example: "2022-05-12T14:00:00Z"
 *               jobListing:
 *                 type: string
 *                 description: ID of the job listing
 *                 example: "8056da561123452d88d367be"
 *               user:
 *                 type: string
 *                 description: ID of the user associated with the session
 *                 example: "605c5e1c8f1d2a34567890ab"
 *     responses:
 *       200:
 *         description: The session was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InterviewSession'
 *       400:
 *         description: Invalid input - Date not within allowed range
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to update this session
 *       404:
 *         description: The session was not found or associated job listing no longer exists
 */
/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session (Limited to 3 per user for non-admin)
 *     tags: [Interview Sessions]
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
 *               - date
 *             properties:
 *               jobListing:
 *                 type: string
 *                 description: ID of the job listing
 *                 example: "8056da561123452d88d367be"
 *               user:
 *                 type: string
 *                 description: ID of the user associated with the session
 *                 example: "605c5e1c8f1d2a34567890ab"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Interview date and time (Must be between May 10-13, 2022)
 *                 example: "2022-05-12T14:00:00Z"
 *     responses:
 *       201:
 *         description: The session was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InterviewSession'
 *       400:
 *         description: Invalid input - Date not within allowed range or session limit reached
 *       401:
 *         description: Unauthorized - Not authenticated
 *       404:
 *         description: Job listing not found
 */
/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Update a session (User who created, company owner, or admin)
 *     tags: [Interview Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The session id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Interview date and time (Must be between May 10-13, 2022)
 *                 example: "2022-05-12T14:00:00Z"
 *     responses:
 *       200:
 *         description: The session was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InterviewSession'
 *       400:
 *         description: Invalid input - Date not within allowed range
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to update this session
 *       404:
 *         description: The session was not found or associated job listing no longer exists
 */
/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Delete a session (User who created, company owner, or admin)
 *     tags: [Interview Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The session id
 *     responses:
 *       200:
 *         description: The session was successfully deleted
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
 *                   description: Empty object is returned after successful deletion
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not authorized to delete this session
 *       404:
 *         description: The session was not found
 */
/**
 * @swagger
 * /users/{id}/sessions:
 *   get:
 *     summary: Get all interview sessions for a specific user (User themselves or admin)
 *     tags: [Interview Sessions, User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: List of interview sessions for this user (can be empty array if no sessions exist)
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
 *         description: Forbidden - Not authorized to view this user's sessions
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /job-listings/{id}/sessions:
 *   get:
 *     summary: Get interview sessions for a job listing (Admin & company owners only)
 *     tags: [Interview Sessions, Job Listings]
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
 *         description: List of interview sessions for this job listing (can be empty array if no sessions exist)
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
 *         description: Job listing not found
 */
/**
 * @swagger
 * /companies/{id}/sessions:
 *   get:
 *     summary: Get all interview sessions for a specific company (Admin & company owner only)
 *     tags: [Interview Sessions, Companies]
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
 *         description: List of interview sessions for this company across all its job listings
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
 *         description: Company not found
 */
