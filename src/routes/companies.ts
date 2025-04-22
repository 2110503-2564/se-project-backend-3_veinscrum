import {
    createCompany,
    deleteCompany,
    getCompanies,
    getCompany,
    updateCompany,
} from "@/controllers/companies";
import { getInterviewSessionsByCompany } from "@/controllers/interviewSessions";
import { getJobListingsByCompany } from "@/controllers/jobListings";
import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
    .route("/")
    .get(getCompanies)
    .post(protect, authorize("company"), createCompany);

router
    .route("/:id")
    .get(getCompany)
    .put(protect, authorize("admin", "company"), updateCompany)
    .delete(protect, authorize("admin", "company"), deleteCompany);

router
    .route("/:id/job-listings")
    .get(protect, authorize("admin", "company"), getJobListingsByCompany);

router
    .route("/:id/sessions")
    .get(protect, authorize("admin", "company"), getInterviewSessionsByCompany);

export { router as companiesRouter };
