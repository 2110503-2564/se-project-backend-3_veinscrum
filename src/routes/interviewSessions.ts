import {
    createInterviewSession,
    deleteInterviewSession,
    getInterviewSession,
    getInterviewSessions,
    updateInterviewSession,
} from "@/controllers/interviewSessions";
import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router({ mergeParams: true });

router
    .route("/")
    .get(protect, getInterviewSessions)
    .post(
        protect,
        authorize("admin", "user", "company"),
        createInterviewSession,
    );

router
    .route("/:id")
    .get(protect, getInterviewSession)
    .put(protect, authorize("admin", "user", "company"), updateInterviewSession)
    .delete(
        protect,
        authorize("admin", "user", "company"),
        deleteInterviewSession,
    );

export { router as interviewSessionsRouter };

/**
* @swagger
* components:
*   schemas:
*     InterviewSession:
*       type: object
*       required:
*         - jobListing
*         - user
*         - date
*       properties:
*         id:
*           type: string
*           format: uuid
*           description: The auto-generated id of the company
*           example: d290f1ee-6c54-4b01-90e6-d701748f0851
*         jobListing:
*           type: string
*           format: uuid
*           description: Id of job listing this session is for
*         user:
*           type: string
*           format: uuid
*           description: Id of user who created this session
*         date:
*           type: string
*           format: date
*           description: Session date
*         createdAt:
*           type: string
*           format: date
*           description: When this session was created
*       example:
*         id: 6056da561452242d88d36e37
*         jobListing: 8056da561123452d88d367be
*         user: 9056da561952242d88d36u99
*         date: 2025-05-02
*         createdAt: 2025-04-12
*/

/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth: # arbitrary name for the security scheme
*       type: http
*       scheme: bearer
*       bearerFormat: JWT # optional, arbitrary value for documentation purposes
*/

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
*
*     responses:
*       200:
*         description: The session was deleted
*       404:
*         description: The session was not found
*/
