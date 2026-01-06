package com.perfect.IndiExport.util;

import java.util.HashMap;
import java.util.Map;

public class CountryUtil {
    
    private static final Map<String, String> COUNTRY_MAP = new HashMap<>();
    
    static {
        // ISO 3166-1 alpha-2 country codes to country names
        COUNTRY_MAP.put("AF", "Afghanistan");
        COUNTRY_MAP.put("AL", "Albania");
        COUNTRY_MAP.put("DZ", "Algeria");
        COUNTRY_MAP.put("AR", "Argentina");
        COUNTRY_MAP.put("AU", "Australia");
        COUNTRY_MAP.put("AT", "Austria");
        COUNTRY_MAP.put("BD", "Bangladesh");
        COUNTRY_MAP.put("BE", "Belgium");
        COUNTRY_MAP.put("BR", "Brazil");
        COUNTRY_MAP.put("BG", "Bulgaria");
        COUNTRY_MAP.put("CA", "Canada");
        COUNTRY_MAP.put("CN", "China");
        COUNTRY_MAP.put("CO", "Colombia");
        COUNTRY_MAP.put("HR", "Croatia");
        COUNTRY_MAP.put("CZ", "Czech Republic");
        COUNTRY_MAP.put("DK", "Denmark");
        COUNTRY_MAP.put("EG", "Egypt");
        COUNTRY_MAP.put("FI", "Finland");
        COUNTRY_MAP.put("FR", "France");
        COUNTRY_MAP.put("DE", "Germany");
        COUNTRY_MAP.put("GR", "Greece");
        COUNTRY_MAP.put("HK", "Hong Kong");
        COUNTRY_MAP.put("HU", "Hungary");
        COUNTRY_MAP.put("IN", "India");
        COUNTRY_MAP.put("ID", "Indonesia");
        COUNTRY_MAP.put("IE", "Ireland");
        COUNTRY_MAP.put("IL", "Israel");
        COUNTRY_MAP.put("IT", "Italy");
        COUNTRY_MAP.put("JP", "Japan");
        COUNTRY_MAP.put("KE", "Kenya");
        COUNTRY_MAP.put("MY", "Malaysia");
        COUNTRY_MAP.put("MX", "Mexico");
        COUNTRY_MAP.put("NL", "Netherlands");
        COUNTRY_MAP.put("NZ", "New Zealand");
        COUNTRY_MAP.put("NG", "Nigeria");
        COUNTRY_MAP.put("NO", "Norway");
        COUNTRY_MAP.put("PK", "Pakistan");
        COUNTRY_MAP.put("PH", "Philippines");
        COUNTRY_MAP.put("PL", "Poland");
        COUNTRY_MAP.put("PT", "Portugal");
        COUNTRY_MAP.put("QA", "Qatar");
        COUNTRY_MAP.put("RO", "Romania");
        COUNTRY_MAP.put("RU", "Russia");
        COUNTRY_MAP.put("SA", "Saudi Arabia");
        COUNTRY_MAP.put("SG", "Singapore");
        COUNTRY_MAP.put("ZA", "South Africa");
        COUNTRY_MAP.put("KR", "South Korea");
        COUNTRY_MAP.put("ES", "Spain");
        COUNTRY_MAP.put("SE", "Sweden");
        COUNTRY_MAP.put("CH", "Switzerland");
        COUNTRY_MAP.put("TW", "Taiwan");
        COUNTRY_MAP.put("TH", "Thailand");
        COUNTRY_MAP.put("TR", "Turkey");
        COUNTRY_MAP.put("AE", "United Arab Emirates");
        COUNTRY_MAP.put("GB", "United Kingdom");
        COUNTRY_MAP.put("US", "United States");
        COUNTRY_MAP.put("VN", "Vietnam");
        // Add more countries as needed
    }
    
    public static String getCountryName(String countryCode) {
        return COUNTRY_MAP.getOrDefault(countryCode.toUpperCase(), countryCode);
    }
    
    public static Map<String, String> getAllCountries() {
        return new HashMap<>(COUNTRY_MAP);
    }
    
    public static boolean isValidCountryCode(String countryCode) {
        return COUNTRY_MAP.containsKey(countryCode.toUpperCase());
    }
}

