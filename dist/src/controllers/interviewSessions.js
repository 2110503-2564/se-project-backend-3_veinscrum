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
import { CompanyModel } from "../models/Company.js";
import { InterviewSessionModel } from "../models/InterviewSession.js";
import { buildComparisonQuery } from "../utils/buildComparisonQuery.js";
import { filterAndPaginate } from "../utils/filterAndPaginate.js";
// @desc    Get all interview sessions
// @route   GET /api/v1/sessions
// @access  Registered users can view their own sessions, admins can view all
export const getInterviewSessions = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req;
            const comparisonQuery = buildComparisonQuery(request.query);
            if (request.user.role !== "admin") {
                comparisonQuery.user = String(request.user.id);
            }
            const baseQuery = InterviewSessionModel.find(
                comparisonQuery,
            ).populate(
                request.user.role === "admin" ? "company user" : "company",
            );
            const result = yield filterAndPaginate({
                request,
                response: res,
                baseQuery,
                total: yield InterviewSessionModel.countDocuments(
                    comparisonQuery,
                ),
            });
            if (!result) return;
            const sessions = yield result.query;
            res.status(200).json({
                success: true,
                count: sessions.length,
                pagination: result.pagination,
                data: sessions,
            });
        } catch (err) {
            next(err);
        }
    });
// @desc    Get single interview session
// @route   GET /api/v1/sessions/:id
// @access  Public
export const getInterviewSession = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const interviewSession = yield InterviewSessionModel.findById(
                req.params.id,
            ).populate({
                path: "user",
                select: "name email",
            });
            if (!interviewSession) {
                res.status(404).json({
                    success: false,
                    message: `No interview session found with id ${req.params.id}`,
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: interviewSession,
            });
        } catch (error) {
            next(error); // Pass the error to the next middleware
        }
    });
// @desc    Create interview session
// @route   POST /api/v1/sessions
// @access  Private
export const createInterviewSession = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req;
            const companies = yield CompanyModel.findById(request.body.company);
            if (!companies) {
                res.status(404).json({
                    success: false,
                    message: `No company found with id ${request.body.company}`,
                });
                return;
            }
            request.body.user = request.user.id;
            const existingSessions = yield InterviewSessionModel.find({
                user: request.user.id,
            });
            // If user is not an admin, they can only create up to 3 interview sessions
            if (existingSessions.length >= 3 && request.user.role !== "admin") {
                res.status(400).json({
                    success: false,
                    message: `User with ID ${request.user.id} has reached the maximum number of interview sessions`,
                });
                return;
            }
            const startDate = new Date("2022-05-10T00:00:00Z");
            const endDate = new Date("2022-05-13T23:59:59Z");
            if (
                new Date(request.body.date) < startDate ||
                new Date(request.body.date) > endDate
            ) {
                res.status(400).json({
                    success: false,
                    message: `Interview sessions can only be scheduled from May 10th to May 13th, 2022`,
                });
                return;
            }
            const interviewSession = yield InterviewSessionModel.create(
                request.body,
            );
            res.status(201).json({
                success: true,
                data: interviewSession,
            });
        } catch (error) {
            next(error);
        }
    });
// @desc    Update interview session
// @route   PUT /api/v1/sessions/:id
// @access  Users can edit their own sessions, admins can edit any
export const updateInterviewSession = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const request = req;
            let session = yield InterviewSessionModel.findById(
                request.params.id,
            );
            if (!session) {
                res.status(404).json({
                    success: false,
                    message: "Session not found",
                });
                return;
            }
            if (
                ((_a = request.user) === null || _a === void 0
                    ? void 0
                    : _a.role) !== "admin" &&
                session.user.toString() !==
                    String(
                        (_b = request.user) === null || _b === void 0
                            ? void 0
                            : _b.id,
                    )
            ) {
                res.status(403).json({
                    success: false,
                    message: "Not authorized",
                });
                return;
            }
            session = yield InterviewSessionModel.findByIdAndUpdate(
                request.params.id,
                request.body,
                { new: true, runValidators: true },
            );
            res.status(200).json({ success: true, data: session });
        } catch (err) {
            next(err);
        }
    });
// @desc    Delete interview session
// @route   DELETE /api/v1/sessions/:id
// @access  Users can delete their own sessions, admins can delete any
export const deleteInterviewSession = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const request = req;
            const session = yield InterviewSessionModel.findById(
                request.params.id,
            );
            if (!session) {
                res.status(404).json({
                    success: false,
                    message: "Session not found",
                });
                return;
            }
            if (
                ((_a = request.user) === null || _a === void 0
                    ? void 0
                    : _a.role) !== "admin" &&
                session.user.toString() !==
                    String(
                        (_b = request.user) === null || _b === void 0
                            ? void 0
                            : _b.id,
                    )
            ) {
                res.status(403).json({
                    success: false,
                    message: "Not authorized",
                });
            }
            yield InterviewSessionModel.deleteOne({ _id: request.params.id });
            res.status(200).json({ success: true, data: {} });
        } catch (err) {
            next(err);
        }
    });
export const getInterviewSessionsByCompany = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req;
            const comparisonQuery = buildComparisonQuery(request.query);
            if (request.user.role !== "admin") {
                comparisonQuery.user = String(request.user.id);
            }
            const baseQuery = InterviewSessionModel.find(
                comparisonQuery,
            ).populate(
                request.user.role === "admin" ? "company user" : "company",
            );
            const result = yield filterAndPaginate({
                request,
                response: res,
                baseQuery,
                total: yield InterviewSessionModel.countDocuments(
                    comparisonQuery,
                ),
            });
            if (!result) return;
            const sessions = yield result.query;
            res.status(200).json({
                success: true,
                count: sessions.length,
                pagination: result.pagination,
                data: sessions,
            });
        } catch (err) {
            next(err);
        }
    });
export const getInterviewSessionsByUser = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const interviewSession = yield InterviewSessionModel.find({
                user: req.params.id,
            }).populate([
                {
                    path: "user",
                    select: "name email",
                },
                {
                    path: "company",
                },
            ]);
            if (!interviewSession) {
                res.status(404).json({
                    success: false,
                    message: `No interview session found with user-id ${req.params.id}`,
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: interviewSession,
            });
        } catch (error) {
            next(error); // Pass the error to the next middleware
        }
    });
