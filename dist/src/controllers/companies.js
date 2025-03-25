var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
import { buildComparisonQuery } from "../utils/buildComparisonQuery.js";
import { filterAndPaginate } from "../utils/filterAndPaginate.js";
import { CompanyModel } from "../models/Company.js";
import { InterviewSessionModel } from "../models/InterviewSession.js";
/// @desc     Get companies (query is allowed)
/// @route    GET /api/v1/companies
/// @access   Public
export const getCompanies = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req;
            const comparisonQuery = buildComparisonQuery(request.query);
            const baseQuery =
                CompanyModel.find(comparisonQuery).populate("sessions");
            const total = yield CompanyModel.countDocuments();
            const result = yield filterAndPaginate({
                request: req,
                response: res,
                baseQuery,
                total,
            });
            if (!result) return;
            const companies = yield result.query;
            res.status(200).json({
                success: true,
                count: companies.length,
                pagination: result.pagination,
                data: companies,
            });
        } catch (err) {
            next(err);
        }
    });
/// @desc     Get company (authentication required)
/// @route    GET /api/v1/companies/:id
/// @access   Protected
export const getCompany = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const company = yield CompanyModel.findById(req.params.id).populate(
                "sessions",
            );
            if (!company) {
                res.status(400).json({
                    success: false,
                    message: "Company not found",
                });
                return;
            }
            res.status(200).json({ success: true, data: company });
        } catch (err) {
            next(err);
        }
    });
/// @desc     Create company (authentication required)
/// @route    POST /api/v1/companies
/// @access   Protected
export function createCompany(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const company = yield CompanyModel.create(req.body);
            res.status(201).json({ success: true, data: company });
        } catch (err) {
            next(err);
        }
    });
}
/// @desc     Update company (authentication required)
/// @route    PUT /api/v1/companies/:id
/// @access   Protected
export function updateCompany(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const company = yield CompanyModel.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true,
                },
            );
            if (!company) {
                res.status(400).json({
                    success: false,
                    message: "Company not found",
                });
                return;
            }
            res.status(200).json({ success: true, data: company });
        } catch (err) {
            next(err);
        }
    });
}
/// @desc     Delete company (authentication required)
/// @route    DELETE /api/v1/companies/:id
/// @access   Protected
export function deleteCompany(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const company = yield CompanyModel.findById(req.params.id);
            if (!company) {
                res.status(400).json({
                    success: false,
                    message: "Company not found",
                });
                return;
            }
            yield InterviewSessionModel.deleteMany({ company: req.params.id });
            yield CompanyModel.deleteOne({ _id: req.params.id });
            res.status(200).json({ success: true, data: {} });
        } catch (err) {
            next(err);
        }
    });
}
