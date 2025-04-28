/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat message management API and Socket events
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - sender
 *         - content
 *         - timestamp
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the message
 *         sender:
 *           type: object
 *           description: The user who sent the message (populated)
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *         content:
 *           type: string
 *           description: The content of the message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message was sent
 */

/**
 * @swagger
 * /chats/{interviewSessionId}/{messageId}:
 *   put:
 *     summary: Update a chat message (authentication required)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interviewSessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The interview session id
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: The message id to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the message
 *     responses:
 *       200:
 *         description: Message updated successfully
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
 *                   properties:
 *                     _id:
 *                       type: string
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       400:
 *         description: Content is required
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this message
 *       404:
 *         description: Chat or message not found
 * 
 *   delete:
 *     summary: Delete a chat message (authentication required)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interviewSessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The interview session id
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: The message id to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
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
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this message
 *       404:
 *         description: Chat or message not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatSocketEvents:
 *       type: object
 *       description: Socket.IO events for real-time chat functionality
 *       properties:
 *         chat-message:
 *           type: object
 *           description: Event emitted when a new message is sent
 *           properties:
 *             event:
 *               type: string
 *               example: "chat-message"
 *             payload:
 *               $ref: '#/components/schemas/Message'
 *         chat-history:
 *           type: object
 *           description: Event emitted when requesting chat history
 *           properties:
 *             event:
 *               type: string
 *               example: "chat-history"
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *         chat-updated:
 *           type: object
 *           description: Event emitted when a message is updated
 *           properties:
 *             event:
 *               type: string
 *               example: "chat-updated"
 *             payload:
 *               $ref: '#/components/schemas/Message'
 *         chat-deleted:
 *           type: object
 *           description: Event emitted when a message is deleted
 *           properties:
 *             event:
 *               type: string
 *               example: "chat-deleted"
 *             payload:
 *               type: object
 *               properties:
 *                 messageId:
 *                   type: string
 *         chat-error:
 *           type: object
 *           description: Event emitted when an error occurs
 *           properties:
 *             event:
 *               type: string
 *               example: "chat-error"
 *             payload:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */