<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function from_transfers()
    {
        return $this->hasMany(Transfer::class, 'from_warehouse_id');
    }

    public function to_transfers()
    {
        return $this->hasMany(Transfer::class, 'to_warehouse_id');
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'warehouse_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        return $query;
    }
}
