package com.ilahiretail.repository;

import com.ilahiretail.entity.Cart;
import com.ilahiretail.entity.CartItem;
import com.ilahiretail.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    void deleteByCart(Cart cart);
}
