"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("@clerk/express");
const requireAuthWithErrorHandler = () => (req, res, next) => {
    (0, express_1.requireAuth)()(req, res, (err) => {
        if (err) {
            console.error('Authentication Error:', err.message);
            return res.status(403).json({
                error: 'Access denied. Authentication required.',
                message: err.message,
            });
        }
        next();
    });
};
exports.default = requireAuthWithErrorHandler;
