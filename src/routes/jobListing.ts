import {
    getJobListings,
    getJobListing,
    createJobListing,
    updateJobListing,
    deleteJobListing
} from "@/controllers/jobListing"
import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
    .route("/")
    .get(getJobListings)
    .post(protect, authorize("admin","company"), createJobListing);

router
    .route("/:id")
    .get(getJobListing)
    .put(protect, authorize("admin","company"), updateJobListing)
    .delete(protect, authorize("admin","company"), deleteJobListing);

export { router as jobListingsRouter };