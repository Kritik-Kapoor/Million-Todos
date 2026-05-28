import jwt from "jsonwebtoken";
export const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies["million-todos-token"];
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized user, No token provided",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Unauthorized user, Invalid token",
        });
    }
};
