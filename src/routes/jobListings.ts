import { getInterviewSessionsByJobListing } from "@/controllers/interviewSessions";
import {
    createJobListing,
    deleteJobListing,
    getJobListing,
    getJobListings,
    updateJobListing,
} from "@/controllers/jobListings";
import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
    .route("/")
    .get(protect, authorize("admin"), getJobListings)
    .post(protect, authorize("admin", "company"), createJobListing);

router
    .route("/:id")
    .get(getJobListing)
    .put(protect, authorize("admin", "company"), updateJobListing)
    .delete(protect, authorize("admin", "company"), deleteJobListing);

router
    .route("/:id/sessions")
    .get(
        protect,
        authorize("user", "admin", "company"),
        getInterviewSessionsByJobListing,
    );

export { router as jobListingsRouter };

/**
* @swagger
* components:
*   schemas:
*     JobListing:
*       type: object
*       required:
*         - company
*         - jobTitle
*         - description
*       properties:
*         id:
*           type: string
*           format: uuid
*           description: The auto-generated id of the job listing
*           example: d290f1ee-6c54-4b01-90e6-d701748f0851
*         company:
*           type: string
*           format: uuid
*           description: Id of the company who post this job
*         image:
*           type: string
*           description: Image data
*         jobTitle:
*           type: string
*           description: Job title
*         description:
*           type: string
*           description: Job description
*         createdAt:
*           type: string
*           format: date
*           description: When this job listing was created
*       example:
*         id: 6056da561452242d88d36e37
*         company: 8056da561123452d88d367be
*         image: image.jpg
*         jobTitle: Coffee maker
*         description: Fine pay
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
*   delete:
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
*         description: The list of the interview sessions
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/InterviewSession'
*       404:
*         description: The job listing was not found
*/