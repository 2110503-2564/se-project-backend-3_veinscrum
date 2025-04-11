import {
    createCompany,
    deleteCompany,
    getCompanies,
    getCompany,
    updateCompany,
} from "@/controllers/companies";
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

export { router as companiesRouter };
