<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesOrderReturn extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function sales_order()
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
    }

    public function sales_order_return_details()
    {
        return $this->hasMany(SalesOrderReturnDetail::class, 'sales_order_return_id');
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
