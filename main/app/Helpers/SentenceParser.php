<?php

namespace App\Helpers;

class SentenceParser
{
    /**
     * Parse sentence text to days
     * 
     * Supports formats like:
     * - "5 Years" -> 1825 days
     * - "2 Months" -> 60 days
     * - "Life" -> 36500 days (~100 years)
     * - "6 Weeks" -> 42 days
     */
    public static function parseToDays(string $sentence): ?int
    {
        $sentence = strtolower(trim($sentence));
        
        // Life sentence
        if (str_contains($sentence, 'life')) {
            return 36500; // ~100 years
        }
        
        // Extract number and unit
        preg_match('/(\d+)\s*(year|yr|month|mo|day|d|week|wk)/i', $sentence, $matches);
        
        if (!$matches) return null;
        
        $number = (int) $matches[1];
        $unit = strtolower($matches[2]);
        
        return match(true) {
            str_starts_with($unit, 'y') => $number * 365,
            str_starts_with($unit, 'mo') => $number * 30,
            str_starts_with($unit, 'w') => $number * 7,
            str_starts_with($unit, 'd') => $number,
            default => null
        };
    }
}

