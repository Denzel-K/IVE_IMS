const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Unified authentication and authorization middleware
exports.authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const token = req.cookies.token;
        console.log("🔍 => Extracted Token:", token || "❌ No Token Found");

        if (!token) {
            console.log('Access denied. No token provided.');
            res.redirect('/');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Attach user info to request
            console.log("✅ Decoded Token:", decoded); 

            // Check if role-based authorization is required
            if (roles.length && !roles.includes(decoded.role)) {
                console.log('Forbidden: Access denied.');
                res.redirect('/');
            }

            next();
        } catch (err) {
            console.error("❌ Token Verification Error:", err.message);
            res.redirect('/');
        }
    };
};