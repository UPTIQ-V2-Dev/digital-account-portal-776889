import { productService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsync from '../utils/catchAsync.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import pick from '../utils/pick.ts';
import httpStatus from 'http-status';

const createProduct = catchAsyncWithAuth(async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(httpStatus.CREATED).send(product);
});

const getProducts = catchAsync(async (req, res) => {
    const filter = pick(req.validatedQuery, ['type', 'isActive']);
    
    // For public endpoint, always show only active products
    filter.isActive = filter.isActive !== undefined ? filter.isActive : true;
    
    const result = await productService.getAllProducts(filter);
    res.send(result);
});

const getAllProductsAdmin = catchAsyncWithAuth(async (req, res) => {
    const filter = pick(req.validatedQuery, ['type', 'isActive', 'name']);
    const options = pick(req.validatedQuery, ['sortBy', 'limit', 'page', 'sortType']);
    
    const result = await productService.queryProducts(filter, options);
    res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    
    // For public endpoint, only return if active
    if (!product.isActive) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    
    res.send(product);
});

const getProductById = catchAsyncWithAuth(async (req, res) => {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    res.send(product);
});

const updateProduct = catchAsyncWithAuth(async (req, res) => {
    const product = await productService.updateProductById(req.params.productId, req.body);
    res.send(product);
});

const deleteProduct = catchAsyncWithAuth(async (req, res) => {
    await productService.deleteProductById(req.params.productId);
    res.status(httpStatus.NO_CONTENT).send();
});

const checkEligibility = catchAsync(async (req, res) => {
    const { customerData } = req.body;
    const result = await productService.checkProductEligibility(req.params.productId, customerData);
    res.send(result);
});

export default {
    createProduct,
    getProducts,
    getAllProductsAdmin,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    checkEligibility
};