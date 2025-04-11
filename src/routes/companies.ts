import {
    createCompany,
    deleteCompany,
    getCompanies,
    getCompany,
    updateCompany,
} from "@/controllers/companies";
import { getInterviewSessionsByCompany } from "@/controllers/interviewSessions";
import { getJobListingByCompany } from "@/controllers/jobListing";
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

router.get(
    "/:id/sessions",
    protect,
    authorize("user", "admin", "company"),
    getInterviewSessionsByCompany,
);

router.get(
    "/:id/job-listings",
    protect,
    authorize("user", "admin", "company"),
    getJobListingByCompany,
);

export { router as companiesRouter };
