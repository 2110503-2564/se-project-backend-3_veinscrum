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
 *     summary: Returns the list of all the sessions
 *     tags: [Interview Sessions]
 *     responses:
 *       200:
 *         description: The list of the sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InterviewSession'
 */

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Get the session by id
 *     tags: [Interview Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The session id
 *     responses:
 *       200:
 *         description: The session description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewSession'
 *       404:
 *         description: The session was not found
 */

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Interview Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterviewSession'
 *     responses:
 *       201:
 *         description: The session was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewSession'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Update the session by the id
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
 *             $ref: '#/components/schemas/InterviewSession'
 *     responses:
 *       200:
 *         description: The session was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewSession'
 *       404:
 *         description: The session was not found
 *       500:
 *         description: Some error happened
 */

/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Remove the session by id
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
 *         description: The session was deleted
 *       404:
 *         description: The session was not found
 */
