<?php

namespace App\Http\Controllers;

use App\Models\Cell;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class CellController extends Controller
{
    /**
     * Display a listing of cells
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Cell::query();

            // Optional pagination params
            $limit = $request->integer('limit');
            $offset = $request->integer('offset', 0);

            // Search functionality
            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%")
                      ->orWhere('type', 'like', "%{$search}%");
                });
            }

            // Filter by type
            if ($request->filled('type')) {
                $query->where('type', $request->get('type'));
            }

            // Filter by status
            if ($request->filled('status')) {
                $query->where('status', $request->get('status'));
            }

            // Compute total before pagination
            $total = (clone $query)->count();

            // Apply ordering and pagination if provided
            $query->orderBy('name');
            if ($limit && $limit > 0) {
                $query->skip(max(0, $offset))->take($limit);
            }

            // Get cells with their current_count from database
            $cells = $query->get();

            // Transform the data to match frontend expectations
            $transformedCells = $cells->map(function ($cell) {
                return [
                    'id' => $cell->id,
                    'name' => $cell->name,
                    'capacity' => $cell->capacity,
                    'currentCount' => $cell->current_count,
                    'type' => $cell->type,
                    'location' => $cell->location,
                    'status' => $cell->status,
                    'availableSpace' => $cell->capacity - $cell->current_count,
                    'occupancyPercentage' => $cell->capacity > 0 ? ($cell->current_count / $cell->capacity) * 100 : 0,
                    'isAtCapacity' => $cell->current_count >= $cell->capacity,
                    'created_at' => $cell->created_at,
                    'updated_at' => $cell->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedCells,
                'pagination' => [
                    'total' => $total,
                    'limit' => $limit ?: $transformedCells->count(),
                    'offset' => $offset,
                    'hasMore' => ($limit && ($offset + $limit) < $total),
                ],
                'message' => 'Cells retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cells: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created cell
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:cells,name'
                ],
                'capacity' => [
                    'required',
                    'integer',
                    'min:1',
                    'max:100'
                ],
                'type' => [
                    'required',
                    Rule::in(['Male', 'Female'])
                ],
                'location' => [
                    'required',
                    'string',
                    'max:255'
                ],
                'status' => [
                    'required',
                    Rule::in(['Active', 'Inactive', 'Maintenance'])
                ]
            ]);

            $cell = Cell::create([
                'name' => $validated['name'],
                'capacity' => $validated['capacity'],
                'current_count' => 0, // Always start with 0
                'type' => $validated['type'],
                'location' => $validated['location'],
                'status' => $validated['status']
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $cell->id,
                    'name' => $cell->name,
                    'capacity' => $cell->capacity,
                    'currentCount' => $cell->current_count,
                    'type' => $cell->type,
                    'location' => $cell->location,
                    'status' => $cell->status,
                    'availableSpace' => $cell->capacity,
                    'occupancyPercentage' => 0,
                    'isAtCapacity' => false,
                    'created_at' => $cell->created_at,
                    'updated_at' => $cell->updated_at,
                ],
                'message' => 'Cell created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create cell: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified cell
     */
    public function show(Cell $cell): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $cell->id,
                    'name' => $cell->name,
                    'capacity' => $cell->capacity,
                    'currentCount' => $cell->current_count,
                    'type' => $cell->type,
                    'location' => $cell->location,
                    'status' => $cell->status,
                    'availableSpace' => $cell->capacity - $cell->current_count,
                    'occupancyPercentage' => $cell->capacity > 0 ? ($cell->current_count / $cell->capacity) * 100 : 0,
                    'isAtCapacity' => $cell->current_count >= $cell->capacity,
                    'created_at' => $cell->created_at,
                    'updated_at' => $cell->updated_at,
                ],
                'message' => 'Cell retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cell: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified cell
     */
    public function update(Request $request, Cell $cell): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('cells', 'name')->ignore($cell->id)
                ],
                'capacity' => [
                    'required',
                    'integer',
                    'min:1',
                    'max:100'
                ],
                'type' => [
                    'required',
                    Rule::in(['Male', 'Female'])
                ],
                'location' => [
                    'required',
                    'string',
                    'max:255'
                ],
                'status' => [
                    'required',
                    Rule::in(['Active', 'Inactive', 'Maintenance'])
                ]
            ]);

            // Check if new capacity is less than current count
            if ($validated['capacity'] < $cell->current_count) {
                return response()->json([
                    'success' => false,
                    'message' => 'New capacity cannot be less than current inmate count (' . $cell->current_count . ')'
                ], 422);
            }

            $cell->update([
                'name' => $validated['name'],
                'capacity' => $validated['capacity'],
                'type' => $validated['type'],
                'location' => $validated['location'],
                'status' => $validated['status']
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $cell->id,
                    'name' => $cell->name,
                    'capacity' => $cell->capacity,
                    'currentCount' => $cell->current_count,
                    'type' => $cell->type,
                    'location' => $cell->location,
                    'status' => $cell->status,
                    'availableSpace' => $cell->capacity - $cell->current_count,
                    'occupancyPercentage' => $cell->capacity > 0 ? ($cell->current_count / $cell->capacity) * 100 : 0,
                    'isAtCapacity' => $cell->current_count >= $cell->capacity,
                    'created_at' => $cell->created_at,
                    'updated_at' => $cell->updated_at,
                ],
                'message' => 'Cell updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cell: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified cell
     */
    public function destroy(Cell $cell): JsonResponse
    {
        try {
            // Check if cell has inmates
            if ($cell->current_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete cell with inmates. Please transfer inmates first.'
                ], 422);
            }

            $cell->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cell deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete cell: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cells available for inmate assignment (with available space)
     */
    public function getAvailableCells(Request $request): JsonResponse
    {
        try {
            $gender = $request->get('gender'); // Male or Female
            
            $query = Cell::active();

            if ($gender) {
                $query->where('type', $gender);
            }

            $cells = $query->orderBy('name')->get();

            // Filter cells with available space
            $availableCells = $cells->filter(function ($cell) {
                return $cell->current_count < $cell->capacity;
            });

            $transformedCells = $availableCells->map(function ($cell) {
                return [
                    'id' => $cell->id,
                    'name' => $cell->name,
                    'capacity' => $cell->capacity,
                    'currentCount' => $cell->current_count,
                    'type' => $cell->type,
                    'location' => $cell->location,
                    'status' => $cell->status,
                    'availableSpace' => $cell->capacity - $cell->current_count,
                    'occupancyPercentage' => $cell->capacity > 0 ? ($cell->current_count / $cell->capacity) * 100 : 0,
                    'isAtCapacity' => $cell->current_count >= $cell->capacity,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedCells,
                'message' => 'Available cells retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available cells: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all cells for a specific gender (for live filtering)
     */
    public function getCellsByGender(Request $request): JsonResponse
    {
        try {
            $gender = $request->get('gender'); // Male or Female
            
            if (!$gender) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gender parameter is required'
                ], 400);
            }

            $query = Cell::where('type', $gender)->orderBy('name');
            $cells = $query->get();

            $transformedCells = $cells->map(function ($cell) {
                return [
                    'id' => $cell->id,
                    'name' => $cell->name,
                    'capacity' => $cell->capacity,
                    'currentCount' => $cell->current_count,
                    'type' => $cell->type,
                    'location' => $cell->location,
                    'status' => $cell->status,
                    'availableSpace' => $cell->capacity - $cell->current_count,
                    'occupancyPercentage' => $cell->capacity > 0 ? ($cell->current_count / $cell->capacity) * 100 : 0,
                    'isAtCapacity' => $cell->current_count >= $cell->capacity,
                    'created_at' => $cell->created_at,
                    'updated_at' => $cell->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedCells,
                'message' => ucfirst(strtolower($gender)) . ' cells retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cells: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cell occupancy count (recalculate from database or use forced count)
     */
    public function updateOccupancy(Request $request, Cell $cell): JsonResponse
    {
        try {
            // Check if we have a force_count parameter
            if ($request->has('force_count')) {
                $forceCount = (int) $request->input('force_count');
                $cell->current_count = $forceCount;
                $cell->save();
            } else {
                // Recalculate from actual inmate assignments in database
                $cell->updateCurrentCount();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $cell->id,
                    'currentCount' => $cell->current_count,
                    'availableSpace' => $cell->capacity - $cell->current_count,
                    'occupancyPercentage' => $cell->capacity > 0 ? ($cell->current_count / $cell->capacity) * 100 : 0,
                    'isAtCapacity' => $cell->current_count >= $cell->capacity,
                ],
                'message' => 'Cell occupancy updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cell occupancy: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cell current count by incrementing or decrementing
     */
    public function updateCount(Request $request, Cell $cell): JsonResponse
    {
        try {
            $request->validate([
                'operation' => 'required|in:+,-'
            ]);

            $operation = $request->get('operation');
            
            if ($operation === '+') {
                if ($cell->current_count >= $cell->capacity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cell is at capacity'
                    ], 400);
                }
                $cell->current_count++;
            } else {
                if ($cell->current_count <= 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cell count cannot go below zero'
                    ], 400);
                }
                $cell->current_count--;
            }

            $cell->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $cell->id,
                    'name' => $cell->name,
                    'current_count' => $cell->current_count,
                    'capacity' => $cell->capacity,
                    'occupancy_percentage' => round(($cell->current_count / $cell->capacity) * 100, 1),
                    'isAtCapacity' => $cell->current_count >= $cell->capacity,
                ],
                'message' => 'Cell count updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cell count: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update occupancy for all cells
     */
    public function updateAllOccupancy(): JsonResponse
    {
        try {
            $cells = Cell::all();
            
            foreach ($cells as $cell) {
                $cell->updateCurrentCount();
            }

            return response()->json([
                'success' => true,
                'message' => 'All cell occupancy counts updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cell occupancy counts: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Batch update cell occupancy counts
     */
    public function batchUpdateOccupancy(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'cell_counts' => 'required|array',
                'cell_counts.*' => 'numeric|min:0'
            ]);

            $cellCounts = $request->input('cell_counts');
            $updatedCells = [];

            foreach ($cellCounts as $cellId => $count) {
                $cell = Cell::find($cellId);
                if ($cell) {
                    $cell->current_count = $count;
                    $cell->save();
                    $updatedCells[] = [
                        'id' => $cell->id,
                        'name' => $cell->name,
                        'currentCount' => $cell->current_count
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'updated_cells' => $updatedCells,
                    'count' => count($updatedCells)
                ],
                'message' => 'Batch cell occupancy update completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to batch update cell occupancy: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cells capacity for dashboard (top 5 cells sorted by occupancy percentage)
     */
    public function getCellsCapacity(): JsonResponse
    {
        try {
            // Get top 5 cells with their capacity information
            $cells = Cell::select('id', 'name', 'capacity', 'current_count', 'status')
                ->where('status', 'Active')
                ->get()
                ->map(function ($cell) {
                    $occupancyPercentage = $cell->capacity > 0 
                        ? round(($cell->current_count / $cell->capacity) * 100, 1) 
                        : 0;

                    // Determine color based on occupancy
                    $color = 'blue';
                    if ($occupancyPercentage >= 90) {
                        $color = 'red';
                    } elseif ($occupancyPercentage >= 70) {
                        $color = 'amber';
                    }

                    return [
                        'id' => $cell->id,
                        'name' => $cell->name,
                        'capacity' => $cell->capacity,
                        'current_count' => $cell->current_count,
                        'occupancy_percentage' => $occupancyPercentage,
                        'color' => $color
                    ];
                })
                ->sortByDesc('occupancy_percentage')
                ->take(5)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $cells
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cells capacity: ' . $e->getMessage()
            ], 500);
        }
    }
}
