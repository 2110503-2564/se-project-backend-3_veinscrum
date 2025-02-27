import { Router } from "express";
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
} from "@/controllers/companies";
import { authorize, protect } from "@/middleware/auth";

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

export { router as companiesRouter };
