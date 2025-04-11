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

export { router as jobListingsRouter };