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
import { UserModel } from "../models/User.js";
import { buildComparisonQuery } from "../utils/buildComparisonQuery.js";
import { filterAndPaginate } from "../utils/filterAndPaginate.js";
/// @desc     Get users (query is allowed)
/// @route    GET /api/v1/users
/// @access   Protected
export const getUsers = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req;
            const comparisonQuery = buildComparisonQuery(request.query);
            const baseQuery = UserModel.find(comparisonQuery);
            const total = yield UserModel.countDocuments();
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
