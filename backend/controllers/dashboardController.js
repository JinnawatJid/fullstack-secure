// backend/controllers/dashboardController.js
module.exports = (dbPool) => {
    return {
      getDashboardData: async (req, res) => {
        try {
          // Set dashboard metrics (you could replace with actual data from database)
          const totalSales = '1,500';
          const bestSeller = 'Apple (100 kg sold)';
          const vatAmount = '105';
          
          // Fetch product list
          const productListQuery = 'SELECT "productID" AS "ID", "productName" AS "Name", "price" AS "Price", "qty" AS "Quantity", "picURLs" AS "Image" FROM "Product"';
          const productListResult = await dbPool.query(productListQuery);
          
          // Send response
          res.json({
            totalSales: totalSales,
            bestSeller: bestSeller,
            vatAmount: vatAmount,
            products: productListResult.rows,
          });
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          res.status(500).json({ message: 'Failed to fetch dashboard data' });
        }
      }
    };
  };