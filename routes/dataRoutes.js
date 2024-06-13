import express from "express";
import { getAllData, getBarChartData, getCombinedData, getData, getPieChartData, getStatistics } from "../controllers/dataController.js";

const router=express.Router();
router.get("/getdata",getData);
router.get("/getAllData",getAllData);
router.get('/getStatistics',getStatistics);
router.get('/getBarChartData',getBarChartData);
router.get('/getPieChartData',getPieChartData);
router.get('/getCombinedData',getCombinedData);


export default router;