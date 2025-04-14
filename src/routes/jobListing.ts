import { getInterviewSessionsByJobListing } from "@/controllers/interviewSessions";
import {
    createJobListing,
    updateJobListing,
    deleteJobListing,
    getJobListing,
    getJobListings
} from "@/controllers/jobListing"
import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
    .route("/")
    .get(protect, authorize("admin"), getJobListings)
    .post(protect, authorize("admin","company"), createJobListing);

router
    .route("/:id")
    .get(getJobListing)
    .put(protect, authorize("admin","company"), updateJobListing)
    .delete(protect, authorize("admin","company"), deleteJobListing);

router
    .route("/:id/sessions")
    .get(protect, authorize("user","admin","company"), getInterviewSessionsByJobListing)

export { router as jobListingsRouter };