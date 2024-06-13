import Data from "../models/dataModel.js";
import fetch from "node-fetch";

export const getData = async (req, res) => {
  try {
    const response = await fetch(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const data = await response.json();
    console.log("Fetched data:", data);

    await Data.deleteMany({});
    console.log("Old data deleted");

    const seededData = await Data.insertMany(data);
    console.log("Data inserted:", seededData);

    res
      .status(200)
      .json({ message: "Database initialized successfully", data: seededData });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({
        message: "Failed to initialize the database",
        error: error.message,
      });
  }
};

export const getAllData = async (req, res) => {
  try {
    const response = await Data.find({});
    res.status(200).json({ message: "All data fields", data: response });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in getting data fields", error: error.message });
  }
};

export const getStatistics = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }
  try {

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (
      isNaN(parsedMonth) ||
      isNaN(parsedYear) ||
      parsedMonth < 1 ||
      parsedMonth > 12
    ) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999);

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);


    const salesData = await Data.find({
      dateOfSale: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalSaleAmount = salesData.reduce(
      (sum, item) => sum + item.price,
      0
    );
    const totalSoldItems = salesData.filter((item) => item.sold).length;
    const totalNotSoldItems = salesData.filter((item) => !item.sold).length;

    res.status(200).json({
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
  }
};

export const getBarChartData = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ message: "Month is required" });
  }

  try {
    const parsedMonth = parseInt(month, 10);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }


    const startDate = new Date(Date.UTC(2000, parsedMonth - 1, 1));
    const endDate = new Date(Date.UTC(2100, parsedMonth, 0, 23, 59, 59, 999));


    const salesData = await Data.find({
      dateOfSale: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const priceRanges = [
      { range: "0-100", min: 0, max: 100, count: 0 },
      { range: "101-200", min: 101, max: 200, count: 0 },
      { range: "201-300", min: 201, max: 300, count: 0 },
      { range: "301-400", min: 301, max: 400, count: 0 },
      { range: "401-500", min: 401, max: 500, count: 0 },
      { range: "501-600", min: 501, max: 600, count: 0 },
      { range: "601-700", min: 601, max: 700, count: 0 },
      { range: "701-800", min: 701, max: 800, count: 0 },
      { range: "801-900", min: 801, max: 900, count: 0 },
      { range: "901-above", min: 901, max: Infinity, count: 0 }
    ];


    salesData.forEach(item => {
      for (const range of priceRanges) {
        if (item.price >= range.min && item.price <= range.max) {
          range.count += 1;
          break;
        }
      }
    });

    res.status(200).json({ data: priceRanges });
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    res.status(500).json({ message: 'Failed to fetch bar chart data', error: error.message });
  }
};




export const getPieChartData = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ message: "Month is required" });
  }

  try {
    const parsedMonth = parseInt(month, 10);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }


    const salesData = await Data.find({
      dateOfSale: {
        $gte: new Date(2000, parsedMonth - 1, 1),
        $lte: new Date(2100, parsedMonth, 0, 23, 59, 59, 999)
      }
    });


    const categoryCounts = {};

    salesData.forEach(item => {
      const category = item.category;
      if (categoryCounts[category]) {
        categoryCounts[category] += 1;
      } else {
        categoryCounts[category] = 1;
      }
    });


    const categories = Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category]
    }));

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({ message: 'Failed to fetch pie chart data', error: error.message });
  }
};

export const getCombinedData = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }

  try {
    const [statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      fetch(`http://localhost:5000/api/getStatistics?month=${month}&year=${year}`),
      fetch(`http://localhost:5000/api/getBarChartData?month=${month}`),
      fetch(`http://localhost:5000/api/getPieChartData?month=${month}`)
    ]);

    const statistics = await statisticsResponse.json();
    const barChartData = await barChartResponse.json();
    const pieChartData = await pieChartResponse.json();


    const combinedData = {
      statistics,
      barChartData,
      pieChartData
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).json({ message: 'Failed to fetch combined data', error: error.message });
  }
};