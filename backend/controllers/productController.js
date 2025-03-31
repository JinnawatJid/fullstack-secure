// backend/controllers/productController.js
module.exports = (productModel) => {
    return {
      getAllProducts: async (req, res) => {
        try {
          const products = await productModel.getAllProducts();
          res.json(products);
        } catch (error) {
          console.error('Error fetching products:', error);
          res.status(500).json({ message: 'Failed to fetch products' });
        }
      },
      
      getProductById: async (req, res) => {
        const productId = req.params.productId;
        if (!productId) {
          return res.status(400).json({ message: 'Product ID is required' });
        }
        
        try {
          const product = await productModel.getProductById(productId);
          if (!product) {
            return res.status(404).json({ message: 'Product not found' });
          }
          res.json(product);
        } catch (error) {
          console.error('Error fetching product:', error);
          res.status(500).json({ message: 'Failed to fetch product' });
        }
      },
      
      createProduct: async (req, res) => {
        const { productName, price, qty, picURLs } = req.sanitizedBody;
        
        if (!productName || !price || !qty) {
          return res.status(400).json({ message: 'Product name, price, and quantity are required' });
        }
        
        try {
          const result = await productModel.createProduct({ productName, price, qty, picURLs });
          res.status(201).json({ message: 'Product added successfully', productId: result.productID });
        } catch (error) {
          console.error('Error creating product:', error);
          res.status(500).json({ message: 'Failed to create product' });
        }
      },
      
      updateProduct: async (req, res) => {
        const productId = req.params.productId;
        const { productName, productPrice, productQuantity, productImage } = req.sanitizedBody;
        
        if (!productId || !productName || !productPrice || !productQuantity) {
          return res.status(400).json({ message: 'Product ID, name, price, and quantity are required' });
        }
        
        try {
          const rowCount = await productModel.updateProduct(productId, { 
            productName, 
            productPrice, 
            productQuantity, 
            productImage 
          });
          
          if (rowCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
          }
          
          res.json({ message: `Product ID ${productId} updated successfully` });
        } catch (error) {
          console.error('Error updating product:', error);
          res.status(500).json({ message: 'Failed to update product' });
        }
      },
      
      deleteProduct: async (req, res) => {
        const productId = req.params.productId;
        
        if (!productId) {
          return res.status(400).json({ message: 'Product ID is required' });
        }
        
        try {
          const rowCount = await productModel.deleteProduct(productId);
          
          if (rowCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
          }
          
          res.json({ message: `Product ID ${productId} deleted successfully` });
        } catch (error) {
          console.error('Error deleting product:', error);
          res.status(500).json({ message: 'Failed to delete product' });
        }
      }
    };
  };