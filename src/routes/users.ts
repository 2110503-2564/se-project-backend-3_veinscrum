import { getInterviewSessionsByUser } from "@/controllers/interviewSessions";
import { getUsers } from "@/controllers/users";
import { authorize, protect } from "@/middleware/auth";
import * as express from "express";

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);
router.get(
    "/:id/sessions",
    protect,
    authorize("user", "admin"),
    getInterviewSessionsByUser,
);

export { router as usersRouter };


/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - name
*         - email
*         - tel
*         - role
*         - password
*       properties:
*         id:
*           type: string
*           format: uuid
*           description: The auto-generated id of the job listing
*           example: d290f1ee-6c54-4b01-90e6-d701748f0851
*         name:
*           type: string
*           description: Account name
*         email:
*           type: string
*           pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
*           description: Account email
*         tel:
*           type: string
*           pattern: /^(\+?0?1\s?)?(\d{3}|\(\d{3}\))([\s-./]?)(\d{3})([\s-./]?)(\d{4})$/
*           description: Account telephone number
*         role:
*           type: string
*           description: Account role
*         company:
*           type: string
*           description: Company under account control
*         password:
*           type: string
*           description: Account password
*         createdAt:
*           type: string
*           format: date
*           description: When this job listing was created
*       example:
*         id: 6056da561452242d88d36e37
*         name: 8056da561123452d88d367be
*         email: example@example.com
*         tel: 0123456789
*         role: user
*         company: 8056da561123452d88d367be
*         password: Pa55w0rD
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
*   name: User
*   description: The user managing API
*/

/**
* @swagger
* /users:
*   get:
*     summary: Returns the list of all the users
*     tags: [User]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: The list of users
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                 count:
*                   type: number
*                 pagination:
*                   type: object
*                   properties:
*                     next:
*                       type: object
*                       properties:
*                         page:
*                           type: number
*                         limit:
*                           type: number
*                 data:
*                   type: array
*                   items:
*                     $ref: '#/components/schemas/User'
*       401:
*         description: Unauthorized
*/

/**
* @swagger
* /users/{id}/sessions:
*   get:
*     summary: Returns the list of all sessions from a user
*     tags: [User]
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
*         description: The list of sessions
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/InterviewSession'
*       401:
*         description: Unauthorized
*/