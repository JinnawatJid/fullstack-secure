module.exports = (dbPool) => {
    return {
      getAllProducts: async () => {
        const query = 'SELECT "productID" AS "ID", "productName" AS "Name", "price" AS "Price", "qty" AS "Quantity", "picURLs" AS "Image" FROM "Product"';
        const result = await dbPool.query(query);
        return result.rows;
      },
      
      getProductById: async (productId) => {
        const query = 'SELECT "productID", "productName", "price", "qty", "picURLs" FROM "Product" WHERE "productID" = $1';
        const result = await dbPool.query(query, [productId]);
        return result.rows[0];
      },
      
      createProduct: async (productData) => {
        const { productName, price, qty, picURLs } = productData;
        const query = 'INSERT INTO "Product" ("productName", "price", "qty", "picURLs") VALUES ($1, $2, $3, $4) RETURNING "productID"';
        const result = await dbPool.query(query, [productName, price, qty, picURLs]);
        return result.rows[0];
      },
      
      updateProduct: async (productId, productData) => {
        const { productName, productPrice, productQuantity, productImage } = productData;
        const query = 'UPDATE "Product" SET "productName" = $1, "price" = $2, "qty" = $3, "picURLs" = $4 WHERE "productID" = $5 RETURNING "productID"';
        const result = await dbPool.query(query, [productName, productPrice, productQuantity, productImage, productId]);
        return result.rowCount;
      },
      
      deleteProduct: async (productId) => {
        const query = 'DELETE FROM "Product" WHERE "productID" = $1';
        const result = await dbPool.query(query, [productId]);
        return result.rowCount;
      }
    };
  };