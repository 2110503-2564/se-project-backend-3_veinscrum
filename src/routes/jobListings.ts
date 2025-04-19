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
        authorize("admin", "company"),
        getInterviewSessionsByJobListing,
    );

export { router as jobListingsRouter };
