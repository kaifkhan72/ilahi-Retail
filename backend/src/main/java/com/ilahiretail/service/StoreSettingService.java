package com.ilahiretail.service;

import java.util.Map;

public interface StoreSettingService {
    Map<String, String> getAllSettings();
    Map<String, String> updateSettings(Map<String, String> settings);
}
