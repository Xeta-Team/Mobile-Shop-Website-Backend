export const adminMiddleware = (req, res, next) => {
    // This middleware must run *after* the main authMiddleware
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed to the next function
    } else {
        // User is not an admin, send a "Forbidden" error
        res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
};