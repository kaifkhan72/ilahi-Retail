package com.ilahiretail.service;

import com.ilahiretail.dto.category.CategoryDto;
import com.ilahiretail.dto.category.CategoryRequest;

import java.util.List;

public interface CategoryService {
    List<CategoryDto> getActiveCategories();
    List<CategoryDto> getAllCategories();
    CategoryDto getCategoryById(Long id);
    CategoryDto createCategory(CategoryRequest request);
    CategoryDto updateCategory(Long id, CategoryRequest request);
}
