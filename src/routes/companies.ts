import { Router } from "express";
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
} from "@/controllers/companies";
import { authorize, protect } from "@/middleware/auth";
import { getInterviewSessionsByCompany } from "@/controllers/interviewSessions";
import { getJobListingByCompany } from "@/controllers/jobListing";

const router = Router();

router
    .route("/")
    .get(getCompanies)
    .post(protect, authorize("admin","company"), createCompany);

router
    .route("/:id")
    .get(getCompany)
    .put(protect, authorize("admin","company"), updateCompany)
    .delete(protect, authorize("admin","company"), deleteCompany);

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
