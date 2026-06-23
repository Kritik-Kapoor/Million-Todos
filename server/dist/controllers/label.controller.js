import { ApiError, ApiResponse, getErrorMessage, } from "../utils/apiResponse.js";
import { prisma } from "../config/db.js";
export const createLabel = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, color } = req.body;
        if (!name || !color) {
            return new ApiError(400, "Name and color are required").send(res);
        }
        const label = await prisma.label.create({
            data: {
                userId,
                name,
                color,
            },
        });
        return new ApiResponse(201, { label }, "Label created successfully").send(res);
    }
    catch (error) {
        return new ApiError(500, getErrorMessage(error)).send(res);
    }
};
export const getLabels = async (req, res) => {
    try {
        const userId = req.user.userId;
        const labels = await prisma.label.findMany({
            where: { userId },
        });
        return new ApiResponse(200, { labels }, "Labels fetched successfully").send(res);
    }
    catch (error) {
        return new ApiError(500, getErrorMessage(error)).send(res);
    }
};
export const updateLabel = async (req, res) => {
    try {
        const userId = req.user.userId;
        const labelId = req.params.labelId;
        if (!labelId)
            return new ApiError(400, "Label id is required").send(res);
        const label = await prisma.label.update({
            where: { id: labelId, userId },
            data: req.body,
        });
        return new ApiResponse(200, { label }, "Label updated successfully").send(res);
    }
    catch (error) {
        return new ApiError(500, getErrorMessage(error)).send(res);
    }
};
export const deleteLabel = async (req, res) => {
    try {
        const labelId = req.params.labelId;
        if (!labelId)
            return new ApiError(400, "Label id is required").send(res);
        await prisma.label.delete({
            where: { id: labelId },
        });
        return new ApiResponse(200, null, "Label deleted successfully").send(res);
    }
    catch (error) {
        return new ApiError(500, getErrorMessage(error)).send(res);
    }
};
