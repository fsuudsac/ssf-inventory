<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseDetail extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }

    public function product_detail()
    {
        return $this->belongsTo(ProductDetail::class, 'product_detail_id');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'purchase_detail_id');
    }

    public function purchase_return_details()
    {
        return $this->hasMany(PurchaseReturnDetail::class, 'purchase_detail_id');
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
