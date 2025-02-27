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

const router = Router();

router
    .route("/")
    .get(getCompanies)
    .post(protect, authorize("user", "admin"), createCompany);

router
    .route("/:id")
    .get(getCompany)
    .put(protect, authorize("user", "admin"), updateCompany)
    .delete(protect, authorize("user", "admin"), deleteCompany);

router.get(
    "/:id/sessions",
    protect,
    authorize("user", "admin"),
    getInterviewSessionsByCompany,
);

export { router as companiesRouter };
