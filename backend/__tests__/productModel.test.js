const Products = require('../models/products');
const db = require('../util/database');

jest.mock('../util/database');

describe('Product Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== CONSTRUCTOR TESTS ==========

  // TEST 1: Product constructor
  test('should create a product object with valid data', () => {
    const product = new Products(
      'Gaming Laptop',
      'High performance laptop',
      1299.99,
      '/img/laptop.jpg',
      1
    );

    expect(product.prodName).toBe('Gaming Laptop');
    expect(product.prodDescription).toBe('High performance laptop');
    expect(product.prodPrice).toBe(1299.99);
    expect(product.prodImg).toBe('/img/laptop.jpg');
    expect(product.categoryId).toBe(1);
  });

  // ========== SAVE TESTS ==========

  // TEST 2: Save product - success
  test('should save product successfully', async () => {
    db.execute.mockResolvedValue([{ insertId: 1 }]);

    const product = new Products('Laptop', 'Description', 999, '/img.jpg', 1);
    const result = await product.save();

    expect(result.result).toBe('success');
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO products'),
      ['Laptop', 'Description', 999, '/img.jpg', 1]
    );
  });

  // TEST 3: Save product - database error
  test('should handle database error on save', async () => {
    db.execute.mockRejectedValue(new Error('Database error'));

    const product = new Products('Laptop', 'Description', 999, '/img.jpg', 1);
    const result = await product.save();

    expect(result.result).toBe('fail');
    expect(result.message).toBe('Database error');
  });

  // ========== FETCH ALL TESTS ==========

  // TEST 4: Fetch all products
  test('should fetch all products with ratings', async () => {
    const mockProducts = [
      {
        prodId: 1,
        productName: 'Laptop',
        productPrice: 1000,
        avgRating: 4.5,
        reviewCount: 10,
      },
      {
        prodId: 2,
        productName: 'Monitor',
        productPrice: 300,
        avgRating: 4.2,
        reviewCount: 5,
      },
    ];

    db.execute.mockResolvedValue([mockProducts]);

    const products = await Products.fetchAll();

    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBe(2);
    expect(products[0].avgRating).toBe(4.5);
    expect(products[0].reviewCount).toBe(10);
  });

  // TEST 5: Fetch all - empty result
  test('should return empty array if no products', async () => {
    db.execute.mockResolvedValue([[]]);

    const products = await Products.fetchAll();

    expect(products).toEqual([]);
  });

  // TEST 6: Fetch all - database error
  test('should throw error on database failure', async () => {
    db.execute.mockRejectedValue(new Error('DB Error'));

    await expect(Products.fetchAll()).rejects.toThrow('DB Error');
  });

  // ========== FETCH BY ID TESTS ==========

  // TEST 7: Fetch product by id
  test('should fetch single product with rating', async () => {
    const mockProduct = [
      {
        prodId: 1,
        productName: 'Laptop',
        productPrice: 1000,
        avgRating: 4.5,
        reviewCount: 10,
      },
    ];

    db.execute.mockResolvedValue([mockProduct]);

    const product = await Products.fetch(1);

    expect(product.length).toBe(1);
    expect(product[0].prodId).toBe(1);
    expect(product[0].avgRating).toBe(4.5);
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('WHERE p.prodId = ?'),
      [1]
    );
  });

  // TEST 8: Fetch product - not found
  test('should return empty array if product not found', async () => {
    db.execute.mockResolvedValue([[]]);

    const product = await Products.fetch(999);

    expect(product).toEqual([]);
  });

  // TEST 9: Fetch product - database error
  test('should throw error on fetch failure', async () => {
    db.execute.mockRejectedValue(new Error('DB Error'));

    await expect(Products.fetch(1)).rejects.toThrow('DB Error');
  });

  // ========== SEARCH TESTS ==========

  // TEST 10: Search products by name
  test('should search products by name or description', async () => {
    const mockResults = [
      { prodId: 1, productName: 'Gaming Laptop', avgRating: 4.5 },
    ];

    db.execute.mockResolvedValue([mockResults]);

    const results = await Products.find('laptop');

    expect(results.length).toBe(1);
    expect(results[0].productName).toContain('Laptop');
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining('LIKE'), [
      '%laptop%',
      '%laptop%',
    ]);
  });

  // TEST 11: Search - no matches
  test('should return empty array if no matches', async () => {
    db.execute.mockResolvedValue([[]]);

    const results = await Products.find('nonexistent');

    expect(results).toEqual([]);
  });

  // TEST 12: Search - database error
  test('should throw error on search failure', async () => {
    db.execute.mockRejectedValue(new Error('DB Error'));

    await expect(Products.find('laptop')).rejects.toThrow('DB Error');
  });

  // ========== UPDATE TESTS ==========

  // TEST 13: Update product
  test('should update product successfully', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await Products.update(
      1,
      'Updated Laptop',
      'Updated description',
      1199,
      'good'
    );

    expect(result.result).toBe('success');
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE products'),
      ['Updated Laptop', 'Updated description', 1199, 'good', 1]
    );
  });

  // TEST 14: Update product - database error
  test('should handle database error on update', async () => {
    db.execute.mockRejectedValue(new Error('DB Error'));

    const result = await Products.update(1, 'Name', 'Desc', 999, 'good');

    expect(result.result).toBe('fail');
    expect(result.message).toBe('DB Error');
  });

  // ========== INVENTORY TESTS ==========

  // TEST 15: Add inventory
  test('should add inventory to product', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await Products.addInventory(1, 50);

    expect(result.result).toBe('success');
    expect(result.message).toBe('quantity updated');
  });

  // TEST 16: Add inventory - invalid quantity (negative)
  test('should reject negative quantity', async () => {
    const result = await Products.addInventory(1, -5);

    expect(result.result).toBe('fail');
    expect(result.message).toContain('positive integer');
  });

  // TEST 17: Add inventory - invalid quantity (zero)
  test('should reject zero quantity', async () => {
    const result = await Products.addInventory(1, 0);

    expect(result.result).toBe('fail');
    expect(result.message).toContain('positive');
  });

  // TEST 18: Add inventory - non-integer quantity
  test('should reject non-integer quantity', async () => {
    const result = await Products.addInventory(1, 5.5);

    expect(result.result).toBe('fail');
    expect(result.message).toContain('integer');
  });

  // TEST 19: Add inventory - product not found
  test('should fail if product not found', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 0 }]);

    const result = await Products.addInventory(999, 10);

    expect(result.result).toBe('fail');
    expect(result.message).toBe('no product found');
  });

  // TEST 20: Add inventory - database error
  test('should handle database error on add inventory', async () => {
    db.execute.mockRejectedValue(new Error('DB Error'));

    const result = await Products.addInventory(1, 10);

    expect(result.result).toBe('fail');
    expect(result.message).toBe('server error');
  });

  // ========== RATING TESTS ==========

  // TEST 21: Products include average rating
  test('should include average rating in fetched products', async () => {
    const mockProducts = [
      {
        prodId: 1,
        productName: 'Laptop',
        productPrice: 1000,
        avgRating: 4.5,
        reviewCount: 10,
      },
    ];

    db.execute.mockResolvedValue([mockProducts]);

    const products = await Products.fetchAll();

    expect(products[0].avgRating).toBe(4.5);
    expect(products[0].reviewCount).toBe(10);
  });

  // TEST 22: Zero rating for no reviews
  test('should show 0 rating if no reviews', async () => {
    const mockProducts = [
      {
        prodId: 1,
        productName: 'New Laptop',
        avgRating: 0,
        reviewCount: 0,
      },
    ];

    db.execute.mockResolvedValue([mockProducts]);

    const products = await Products.fetchAll();

    expect(products[0].avgRating).toBe(0);
    expect(products[0].reviewCount).toBe(0);
  });

  // TEST 23: Fetch includes review count
  test('should include review count in product', async () => {
    const mockProduct = [
      {
        prodId: 1,
        productName: 'Laptop',
        avgRating: 4.5,
        reviewCount: 25,
      },
    ];

    db.execute.mockResolvedValue([mockProduct]);

    const product = await Products.fetch(1);

    expect(product[0].reviewCount).toBe(25);
  });
});
