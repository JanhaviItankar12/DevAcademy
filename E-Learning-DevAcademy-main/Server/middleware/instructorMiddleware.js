export const instructorMiddleware = (req, res, next) => {
    try {
        if (req.user.role !== 'instructor') {
            return res.status(403).json({
                message: "Access denied. Instructor role required.",
                success: false
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message
        });
    }
};