<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoricalData extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function historicalable()
    {
        return $this->morphTo('historicalable');
    }

    public function scopeFilter($query, $request)
    {
        return $query;
    }
}
