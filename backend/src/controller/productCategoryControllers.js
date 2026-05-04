import express from "express";
import productCategory from "../models/productCategory.js";

export const getAllCategory = async (req, res) => {
    try{
        const category = await productCategory.find();
        res.status(200).json(category);
    }
    catch(error){
        res.status(500).json({message: error.message});
    };
};

export const createCategory = async (req, res) => {
    try{
        const { name } = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, "-");
        const category = await productCategory.create({
            name,
            slug
        });

        res.status(201).json(category);
    }
    catch(error){
        res.status(500).json({message: error.message});
    };
};

export const updateCategory = async (req, res) => {
    try{
        const { name } = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, "-");

        const updateCategory = await productCategory.findByIdAndUpdate(req.params.id, {
            name,
            slug
        },{new: true});
        res.status(200).json(updateCategory);
    }
    catch(error){
        res.status(500).json({message: error.message})
    };
};

export const deleteCategory = async (req, res) => {
    try{
        const deleteCategory = await productCategory.findByIdAndDelete(req.params.id);

        res.status(200).json(deleteCategory);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}