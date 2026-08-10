<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductDetailPrice extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
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
        if ($request->filled('product_detail_id')) {
            $query->where('product_detail_id', $request->product_detail_id);
        }
        if ($request->filled('from')) {
            if ($request->from == 'ModalProductDetail') {
                $query->where('product_detail_id', $request->product_detail_id);
            }
        }

        return $query;
    }
}
