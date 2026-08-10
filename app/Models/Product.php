<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function product_category()
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    public function product_details()
    {
        return $this->hasMany(ProductDetail::class, 'product_id');
    }

    public function sales_order_details()
    {
        return $this->hasMany(SalesOrderDetail::class, 'product_id');
    }

    public function purchase_details()
    {
        return $this->hasMany(PurchaseDetail::class, 'product_id');
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachmentable');
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
