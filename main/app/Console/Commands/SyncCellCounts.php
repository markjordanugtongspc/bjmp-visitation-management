<?php

namespace App\Console\Commands;

use App\Models\Cell;
use Illuminate\Console\Command;

class SyncCellCounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cells:sync-counts {--force : Force sync even if counts match}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync current_count field with actual inmate count for all cells';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cell count synchronization...');
        
        $cells = Cell::all();
        $updated = 0;
        $total = $cells->count();
        
        $progressBar = $this->output->createProgressBar($total);
        $progressBar->start();
        
        foreach ($cells as $cell) {
            $actualCount = $cell->inmates()->where('status', 'Active')->count();
            
            if ($this->option('force') || $cell->current_count !== $actualCount) {
                $cell->update(['current_count' => $actualCount]);
                $updated++;
                
                if ($actualCount !== $cell->current_count) {
                    $this->line("\nUpdated {$cell->name}: {$cell->current_count} → {$actualCount}");
                }
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->newLine();
        
        $this->info("Synchronization complete!");
        $this->info("Total cells: {$total}");
        $this->info("Updated cells: {$updated}");
        
        if ($updated === 0 && !$this->option('force')) {
            $this->comment('All cell counts are already synchronized.');
        }
        
        return Command::SUCCESS;
    }
}