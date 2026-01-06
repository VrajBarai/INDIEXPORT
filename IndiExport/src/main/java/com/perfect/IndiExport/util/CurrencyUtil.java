package com.perfect.IndiExport.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

public class CurrencyUtil {

    // Exchange rates (base: INR = 1.0)
    // In production, fetch from external API like exchangerate-api.com or fixer.io
    private static final Map<String, Double> EXCHANGE_RATES = new HashMap<>();

    static {
        EXCHANGE_RATES.put("INR", 1.0);
        EXCHANGE_RATES.put("USD", 0.012); // 1 INR = 0.012 USD (approx)
        EXCHANGE_RATES.put("GBP", 0.0095);
        EXCHANGE_RATES.put("EUR", 0.011);
        EXCHANGE_RATES.put("JPY", 1.8);
        EXCHANGE_RATES.put("CNY", 0.087);
        EXCHANGE_RATES.put("AUD", 0.018);
        EXCHANGE_RATES.put("CAD", 0.016);
        EXCHANGE_RATES.put("CHF", 0.011);
        EXCHANGE_RATES.put("SGD", 0.016);
        EXCHANGE_RATES.put("AED", 0.044);
        EXCHANGE_RATES.put("SAR", 0.045);
    }

    public static java.util.List<String> getSupportedCurrencies() {
        return new java.util.ArrayList<>(EXCHANGE_RATES.keySet());
    }

    public static BigDecimal convertFromINR(BigDecimal amountINR, String targetCurrency) {
        if (amountINR == null)
            return BigDecimal.ZERO;
        if (targetCurrency == null || targetCurrency.equals("INR")) {
            return amountINR;
        }

        Double rate = EXCHANGE_RATES.getOrDefault(targetCurrency.toUpperCase(), 1.0);
        return amountINR.multiply(BigDecimal.valueOf(rate))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public static String getCurrencySymbol(String currencyCode) {
        return switch (currencyCode.toUpperCase()) {
            case "USD" -> "$";
            case "GBP" -> "£";
            case "EUR" -> "€";
            case "INR" -> "₹";
            case "JPY" -> "¥";
            case "CNY" -> "¥";
            case "AUD" -> "A$";
            case "CAD" -> "C$";
            case "CHF" -> "CHF ";
            case "SGD" -> "S$";
            case "AED" -> "AED ";
            case "SAR" -> "SAR ";
            default -> currencyCode + " ";
        };
    }

    public static String getCurrencyFromCountry(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> "USD";
            case "GB" -> "GBP";
            case "IN" -> "INR";
            case "EU", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "FI", "GR", "PT", "IE" -> "EUR";
            case "JP" -> "JPY";
            case "CN" -> "CNY";
            case "AU" -> "AUD";
            case "CA" -> "CAD";
            case "CH" -> "CHF";
            case "SG" -> "SGD";
            case "AE" -> "AED";
            case "SA" -> "SAR";
            default -> "USD";
        };
    }
}
