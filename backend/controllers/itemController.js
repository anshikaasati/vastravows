import { validationResult } from 'express-validator';
import * as itemService from '../services/itemService.js';

export const createItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const item = await itemService.createNewItem(req.user, req.body, req.files);
    res.status(201).json(item);
  } catch (error) {
    if (error.message.includes('Free tier limit') || error.message.includes('Upgrade to Premium')) {
      res.status(403);
    }
    next(error);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const items = await itemService.fetchItems(req.query);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const result = await itemService.fetchItemById(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Item not found') {
      res.status(404);
    }
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const updatedItem = await itemService.updateItemDetails(req.params.id, req.user, req.body, req.files);
    res.json(updatedItem);
  } catch (error) {
    if (error.message === 'Item not found') res.status(404);
    if (error.message === 'You can only update your own items') res.status(403);
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const result = await itemService.deleteItemById(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    if (error.message === 'Item not found') res.status(404);
    if (error.message === 'You can only delete your own items') res.status(403);
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await itemService.fetchRecommendations(req.params.id);
    res.json(recommendations);
  } catch (error) {
    if (error.message === 'Item not found') res.status(404);
    next(error);
  }
};
