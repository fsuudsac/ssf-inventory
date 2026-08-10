<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrderDetail extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function sales()
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
    }

    public function product_detail()
    {
        return $this->belongsTo(ProductDetail::class, 'product_detail_id');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'sales_order_detail_id');
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
