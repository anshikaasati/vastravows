import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { createItem, getItems, getItemById, updateItem, deleteItem } from '../controllers/itemController.js';

const router = express.Router();

const itemValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('gender').isIn(['men', 'women']).withMessage('Gender must be men or women'),
  body('category')
    .isIn(['clothes', 'jewellery', 'accessories', 'watch', 'shoes'])
    .withMessage('Category must be one of: clothes, jewellery, accessories, watch, shoes'),
  body('subcategory').notEmpty().withMessage('Subcategory is required'),
  body('size').notEmpty().withMessage('Size is required'),
  body('rentPricePerDay').isFloat({ min: 0 }).withMessage('Rent price is required'),
  body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be positive'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.pincode').notEmpty().withMessage('Pincode is required'),
  body('addressLine').notEmpty().withMessage('Address is required')
];

router.route('/')
  .post(protect, upload.array('images', 5), itemValidation, createItem)
  .get(getItems);

router.route('/:id')
  .get(getItemById)
  .put(protect, upload.array('images', 5), updateItem)
  .delete(protect, deleteItem);

export default router;


