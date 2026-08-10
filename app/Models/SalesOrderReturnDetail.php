<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrderReturnDetail extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function sales_order_return()
    {
        return $this->belongsTo(SalesOrderReturn::class, 'sales_order_return_id');
    }

    public function sales_order_detail()
    {
        return $this->belongsTo(SalesOrderDetail::class, 'sales_order_detail_id');
    }

    public function product_detail()
    {
        return $this->belongsTo(ProductDetail::class, 'product_detail_id');
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
