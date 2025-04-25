import { FlagModel } from "@/models/Flag";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import { Company } from "@/types/models/Company";
import { Flag } from "@/types/models/Flag";
import { JobListing } from "@/types/models/JobListing";
import { User } from "@/types/models/User";
import type { RequestWithAuth } from "@/types/Request";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

/// @desc     Get flaged user
/// @route    GET /api/v1/job-listings/:id/flags
/// @access   Protect
export const getFlagsByJobListing = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const request = req as RequestWithAuth;
        const { id: userId, role: userRole } = request.user;

        const jobListing = await JobListingModel.findById(request.params.id)
            .populate({
                path: "company",
                select: "owner",
            })
            .lean<
                JobListing & { company: Company } & Required<{
                        _id: mongoose.Types.ObjectId;
                    }>
            >();

        if (!jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing not found",
            });
            return;
        }

        if (
            userRole !== "admin" &&
            String(userId) !== String(jobListing.company.owner)
        ) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to view this job listing flag",
            });
            return;
        }

        const flagUsers = await FlagModel.find({
            jobListing: req.params.id,
        })
            .populate({ path: "user", select: "name email tel" })
            .lean<
                Array<
                    Flag & {
                        user: Pick<User, "name" | "email" | "tel">;
                    } & Required<{
                            _id: mongoose.Types.ObjectId;
                        }>
                >
            >();

        res.status(200).json({
            success: true,
            data: flagUsers,
        });
    } catch (err) {
        next(err);
    }
};

/// @desc     Create flag (authentication required)
/// @route    POST /api/v1/flags
/// @access   Protected
export async function createFlag(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const user = await UserModel.findById(req.body.user);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }

        const jobListing = await JobListingModel.findById(req.body.jobListing);
        if (!jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing not found",
            });
            return;
        }

        const flag = await FlagModel.find({
            jobListing: req.body.jobListing,
            user: req.body.user,
        });

        if (flag.length != 0) {
            res.status(400).json({
                success: false,
                error: "Flag already existed",
            });
            return;
        }

        const newFlag = await FlagModel.create(req.body);

        res.status(201).json({ success: true, data: newFlag });
    } catch (err) {
        next(err);
    }
}

/// @desc     Delete flag (authentication required)
/// @route    DELETE /api/v1/flags/:id
/// @access   Protected
export async function deleteFlag(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const request = req as RequestWithAuth;
        const { id: userId, role: userRole } = request.user;

        const flag = await FlagModel.findById(req.params.id).lean<
            Flag & {
                jobListing: JobListing & { company: Company };
            } & { user: User } & Required<{ _id: mongoose.Types.ObjectId }>
        >();

        if (!flag) {
            res.status(404).json({
                success: false,
                error: "Flag not found",
            });
            return;
        }

        const jobListing = await JobListingModel.findById(flag.jobListing)
            .populate({
                path: "company",
                select: "owner",
            })
            .lean<
                JobListing & { company: Company } & Required<{
                        _id: mongoose.Types.ObjectId;
                    }>
            >();

        if (!jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing not found",
            });
            return;
        }

        if (
            userRole !== "admin" &&
            String(userId) !== String(jobListing.company.owner)
        ) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to delete this job listing",
            });

            return;
        }

        await FlagModel.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
}
