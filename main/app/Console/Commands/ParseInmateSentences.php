<?php

namespace App\Console\Commands;

use App\Helpers\SentenceParser;
use App\Models\Inmate;
use Illuminate\Console\Command;

class ParseInmateSentences extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inmates:parse-sentences';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Parse existing sentence text to days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Parsing inmate sentences...');
        
        $inmates = Inmate::whereNull('original_sentence_days')->get();
        
        if ($inmates->isEmpty()) {
            $this->info('No inmates found without parsed sentences.');
            return Command::SUCCESS;
        }
        
        $this->info("Found {$inmates->count()} inmates to process.");
        
        $successCount = 0;
        $failureCount = 0;
        
        foreach ($inmates as $inmate) {
            $days = SentenceParser::parseToDays($inmate->sentence);
            if ($days) {
                $inmate->original_sentence_days = $days;
                $inmate->save();
                $this->info("✓ Parsed {$inmate->full_name}: {$inmate->sentence} = {$days} days");
                $successCount++;
            } else {
                $this->warn("✗ Could not parse {$inmate->full_name}: {$inmate->sentence}");
                $failureCount++;
            }
        }
        
        $this->newLine();
        $this->info("Done! Successfully parsed: {$successCount}, Failed: {$failureCount}");
        
        return Command::SUCCESS;
    }
}
