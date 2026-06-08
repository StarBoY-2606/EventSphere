import { Request, Response } from "express";
import { db } from "../services/dbService";

export const getDashboard = async (_req: Request, res: Response) => {
  res.json(await db.getAnalytics());
};

export const getActivities = async (_req: Request, res: Response) => {
  res.json(await db.getActivities());
};
