import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UserRole } from "../types";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: UserRole } | null;
}

// Attach user to req if token is present (does not block unauthenticated)
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  req.user = token ? verifyToken(token) : null;
  next();
};

// Block unauthenticated requests
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticateToken(req, res, () => {
    if (!req.user) return res.status(401).json({ error: "Access Denied. Identity validation required." });
    next();
  });
};

// Block requests without the required role
export const requireRole = (allowedRoles: UserRole[]) => [
  requireAuth,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Privileged Access. This action is unauthorized for your role level." });
    }
    next();
  }
];
