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
<<<<<<< HEAD
    .post(protect, authorize("admin", "company"), createCompany);
=======
    .post(protect, authorize("admin","company"), createCompany);
>>>>>>> 66f2603 (feat: add jobListing route)

router
    .route("/:id")
    .get(getCompany)
<<<<<<< HEAD
    .put(protect, authorize("admin", "company"), updateCompany)
    .delete(protect, authorize("admin", "company"), deleteCompany);
=======
    .put(protect, authorize("admin","company"), updateCompany)
    .delete(protect, authorize("admin","company"), deleteCompany);

router.get(
    "/:id/sessions",
    protect,
    authorize("user", "admin", "company"),
    getInterviewSessionsByCompany,
);
>>>>>>> 66f2603 (feat: add jobListing route)

export { router as companiesRouter };
