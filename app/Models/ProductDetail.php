<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductDetail extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function product_size()
    {
        return $this->belongsTo(ProductSize::class, 'product_size_id');
    }

    public function product_type()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id');
    }

    public function product_detail_prices()
    {
        return $this->hasMany(ProductDetailPrice::class, 'product_detail_id');
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'product_detail_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('from')) {
            if ($request->from == 'product_info') {
                $query->where('product_id', $request->product_id);
            }
        }

        if ($request->filled('from_warehouse_id')) {
            $query->whereHas('inventories', function ($query) use ($request) {
                $query->where('warehouse_id', $request->from_warehouse_id);
            });
        }

        return $query;
    }
}
