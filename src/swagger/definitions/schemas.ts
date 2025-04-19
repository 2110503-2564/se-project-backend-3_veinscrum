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
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: Account name
 *         email:
 *           type: string
 *           pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
 *           description: Account email
 *         tel:
 *           type: string
 *           description: Phone number
 *         role:
 *           type: string
 *           description: User role (admin, user, company)
 *         company:
 *           type: string
 *           description: Reference to company (if role is company)
 *         password:
 *           type: string
 *           format: password
 *           description: User password
 *         createdAt:
 *           type: string
 *           format: date
 *           description: When this user was created
 *       example:
 *         id: 6056da561452242d88d36e37
 *         name: John Doe
 *         email: example@example.com
 *         tel: 0123456789
 *         role: user
 *         company: 8056da561123452d88d367be
 *         password: Pa55w0rD
 *         createdAt: 2025-04-12
 * 
 *     Company:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - website
 *         - description
 *         - tel
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the company
 *         name:
 *           type: string
 *           description: Company name
 *         address:
 *           type: string
 *           description: Company address
 *         website:
 *           type: string
 *           description: Company website
 *         description:
 *           type: string
 *           description: Company description
 *         tel:
 *           type: string
 *           description: Company telephone
 *         owner:
 *           type: string
 *           description: Owner user ID
 *         createdAt:
 *           type: string
 *           format: date
 *           description: When the company was created
 *       example:
 *         id: 6056da561452242d88d36e37
 *         name: Tech Company
 *         address: 123 Main St
 *         website: https://example.com
 *         description: A technology company
 *         tel: 0123456789
 *         owner: 8056da561123452d88d367be
 *         createdAt: 2025-04-12
 * 
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
 *         company:
 *           type: string
 *           description: Company ID
 *         jobTitle:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Job description
 *         image:
 *           type: string
 *           description: Job image URL
 *         createdAt:
 *           type: string
 *           format: date
 *           description: When this job listing was created
 *       example:
 *         id: 6056da561452242d88d36e37
 *         company: 8056da561123452d88d367be
 *         jobTitle: Coffee maker
 *         description: Fine pay
 *         createdAt: 2025-04-12
 * 
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
 *           description: The auto-generated id of the session
 *         jobListing:
 *           type: string
 *           description: Reference to job listing
 *         user:
 *           type: string
 *           description: Reference to user applying for the job
 *         date:
 *           type: string
 *           format: date-time
 *           description: Interview date and time
 *         createdAt:
 *           type: string
 *           format: date
 *           description: When this session was created
 *       example:
 *         id: 6056da561452242d88d36e37
 *         jobListing: 8056da561123452d88d367be
 *         user: 7056da561123452d88d367bc
 *         date: 2025-04-12T14:00:00Z
 *         createdAt: 2025-04-12
 */
