import {
    createCompany,
    deleteCompany,
    getCompanies,
    getCompany,
    updateCompany,
} from "@/controllers/companies";

import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
    .route("/")
    .get(getCompanies)
    .post(protect, authorize("admin", "company"), createCompany);

router
    .route("/:id")
    .get(getCompany)
    .put(protect, authorize("admin", "company"), updateCompany)
    .delete(protect, authorize("admin", "company"), deleteCompany);

export { router as companiesRouter };

/**
* @swagger
* components:
*   schemas:
*     Company:
*       type: object
*       required:
*         - name
*         - address
*         - description
*         - tel
*         - owner
*       properties:
*         id:
*           type: string
*           format: uuid
*           description: The auto-generated id of the company
*           example: d290f1ee-6c54-4b01-90e6-d701748f0851
*         name:
*           type: string
*           description: Company name
*         address:
*           type: string
*           description: House No., Street, Road
*         website:
*           type: string
*           pattern: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
*           description: Company's website
*         description:
*           type: string
*           description: Company's description
*         tel:
*           type: string
*           pattern: /^(\+?0?1\s?)?(\d{3}|\(\d{3}\))([\s-./]?)(\d{3})([\s-./]?)(\d{4})$/
*           description: Company's telephone number
*         logo:
*           type: string
*           description: Company's logo image
*         owner:
*           type: string
*           format: uuid
*           description: User who created this company
*       example:
*         id: 609bda561452242d88d36e37
*         name: Happy Hospital
*         address: 121 ถ.สุขุมวิท
*         website: https://hpyhospital.com
*         description: Happiness is our goal
*         tel: 02-2187000
*         logo: very_cool_logo.png
*         owner: 609bda561452242d88d36e38
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
*   name: Companies
*   description: The company managing API
*/

/**
* @swagger
* /companies:
*   get:
*     summary: Returns the list of all the companies
*     tags: [Companies]
*     responses:
*       200:
*         description: The list of the companies
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Company'
*/

/**
* @swagger
* /companies/{id}:
*   get:
*     summary: Get the company by id
*     tags: [Companies]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The company id
*     responses:
*       200:
*         description: The company description by id
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Company'
*       404:
*         description: The company was not found
*/

/**
* @swagger
* /companies:
*   post:
*     summary: Create a new company
*     tags: [Companies]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Company'
*     responses:
*       201:
*         description: The company was successfully created
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Company'
*       500:
*         description: Some server error
*/

/**
* @swagger
* /companies/{id}:
*   put:
*     summary: Update the company by the id
*     tags: [Companies]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The company id
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Company'
*     responses:
*       200:
*         description: The company was updated
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Company'
*       404:
*         description: The company was not found
*       500:
*         description: Some error happened
*/

/**
* @swagger
* /companies/{id}:
*   delete:
*     summary: Remove the company by id
*     tags: [Companies]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The company id
*
*     responses:
*       200:
*         description: The company was deleted
*       404:
*         description: The company was not found
*/
