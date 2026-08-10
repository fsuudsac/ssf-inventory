<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrderWarranty extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function sales()
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
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
