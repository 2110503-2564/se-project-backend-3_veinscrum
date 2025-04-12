import { getInterviewSessionsByJobListing } from "@/controllers/interviewSessions";
import {
    createJobListing,
    updateJobListing,
    deleteJobListing
} from "@/controllers/jobListing"
import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
    .route("/")
    .post(protect, authorize("admin","company"), createJobListing);

router
    .route("/:id")
    .put(protect, authorize("admin","company"), updateJobListing)
    .delete(protect, authorize("admin","company"), deleteJobListing);

router
    .route("/:id/sessions")
    .get(protect, authorize("user","admin","company"), getInterviewSessionsByJobListing)

export { router as jobListingsRouter };