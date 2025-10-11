<?php

namespace App\Services;

use App\Models\Inmate;
use App\Models\PointsHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PointsService
{
    // Tiered reduction mapping
    const SENTENCE_REDUCTION_TIERS = [
        100 => 3,   // 3 days
        200 => 7,   // 7 days
        300 => 14,  // 14 days
        400 => 21,  // 21 days
        500 => 30,  // 30 days (max)
    ];

    /**
     * Add points to an inmate and create history record
     */
    public function addPoints(Inmate $inmate, int $points, string $activity, ?string $notes, Carbon $date): Inmate
    {
        return DB::transaction(function() use ($inmate, $points, $activity, $notes, $date) {
            $pointsBefore = $inmate->current_points;
            $inmate->current_points = max(0, min(500, $inmate->current_points + $points)); // Cap between 0-500
            $inmate->save();

            PointsHistory::create([
                'inmate_id' => $inmate->id,
                'points_delta' => $points,
                'points_before' => $pointsBefore,
                'points_after' => $inmate->current_points,
                'activity' => $activity,
                'notes' => $notes,
                'activity_date' => $date,
                'created_by_user_id' => auth()->id()
            ]);

            $this->recalculateSentenceReduction($inmate);

            Log::info('Points added to inmate', [
                'inmate_id' => $inmate->id,
                'points_added' => $points,
                'points_before' => $pointsBefore,
                'points_after' => $inmate->current_points,
                'activity' => $activity,
                'created_by' => auth()->id()
            ]);

            return $inmate->fresh(['pointsHistory']);
        });
    }

    /**
     * Calculate sentence reduction based on points
     */
    public function calculateSentenceReduction(int $points): int
    {
        $reduction = 0;
        foreach (self::SENTENCE_REDUCTION_TIERS as $threshold => $days) {
            if ($points >= $threshold) {
                $reduction = $days;
            }
        }
        return $reduction;
    }

    /**
     * Recalculate and update sentence reduction for an inmate
     */
    private function recalculateSentenceReduction(Inmate $inmate): void
    {
        $reduction = $this->calculateSentenceReduction($inmate->current_points);
        $inmate->reduced_sentence_days = $reduction;

        if ($inmate->date_of_admission && $inmate->original_sentence_days) {
            $adjustedDays = max(0, $inmate->original_sentence_days - $reduction);
            $inmate->adjusted_release_date = $inmate->date_of_admission->copy()->addDays($adjustedDays);
        }

        $inmate->save();
    }

    /**
     * Get tier information for current points
     */
    public function getCurrentTier(int $points): array
    {
        foreach (self::SENTENCE_REDUCTION_TIERS as $threshold => $days) {
            if ($points >= $threshold) {
                return [
                    'threshold' => $threshold,
                    'days' => $days,
                    'label' => $this->getTierLabel($threshold),
                    'color' => $this->getTierColor($threshold)
                ];
            }
        }

        return [
            'threshold' => 0,
            'days' => 0,
            'label' => 'None',
            'color' => 'text-gray-600'
        ];
    }

    /**
     * Get next tier information
     */
    public function getNextTier(int $points): ?array
    {
        foreach (self::SENTENCE_REDUCTION_TIERS as $threshold => $days) {
            if ($points < $threshold) {
                return [
                    'threshold' => $threshold,
                    'days' => $days,
                    'label' => $this->getTierLabel($threshold),
                    'color' => $this->getTierColor($threshold),
                    'points_needed' => $threshold - $points
                ];
            }
        }

        return null; // Max tier reached
    }

    /**
     * Get tier label
     */
    private function getTierLabel(int $threshold): string
    {
        return match($threshold) {
            500 => 'Maximum',
            400 => 'Excellent',
            300 => 'Good',
            200 => 'Fair',
            100 => 'Basic',
            default => 'None'
        };
    }

    /**
     * Get tier color
     */
    private function getTierColor(int $threshold): string
    {
        return match($threshold) {
            500 => 'text-purple-600',
            400 => 'text-blue-600',
            300 => 'text-green-600',
            200 => 'text-yellow-600',
            100 => 'text-orange-600',
            default => 'text-gray-600'
        };
    }
}
