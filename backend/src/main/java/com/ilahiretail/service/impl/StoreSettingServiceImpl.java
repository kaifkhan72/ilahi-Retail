package com.ilahiretail.service.impl;

import com.ilahiretail.entity.StoreSetting;
import com.ilahiretail.repository.StoreSettingRepository;
import com.ilahiretail.service.StoreSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StoreSettingServiceImpl implements StoreSettingService {

    private final StoreSettingRepository storeSettingRepository;

    @Override
    public Map<String, String> getAllSettings() {
        List<StoreSetting> settings = storeSettingRepository.findAll();
        Map<String, String> result = new HashMap<>();
        for (StoreSetting s : settings) {
            result.put(s.getSettingKey(), s.getSettingValue() != null ? s.getSettingValue() : "");
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, String> updateSettings(Map<String, String> newSettings) {
        if (newSettings != null) {
            newSettings.forEach((key, val) -> {
                StoreSetting setting = storeSettingRepository.findBySettingKey(key)
                        .orElseGet(() -> StoreSetting.builder().settingKey(key).build());
                setting.setSettingValue(val != null ? val : "");
                storeSettingRepository.save(setting);
            });
        }
        return getAllSettings();
    }
}
