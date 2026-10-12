package com.ilahiretail.repository;

import com.ilahiretail.entity.StoreSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreSettingRepository extends JpaRepository<StoreSetting, Long> {
    Optional<StoreSetting> findBySettingKey(String settingKey);
}
