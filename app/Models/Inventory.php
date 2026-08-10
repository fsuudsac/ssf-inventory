<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function product_detail()
    {
        return $this->belongsTo(Product::class, 'product_detail_id');
    }

    public function purchase_detail()
    {
        return $this->belongsTo(PurchaseDetail::class, 'purchase_detail_id');
    }

    public function purchase_return_detail()
    {
        return $this->belongsTo(PurchaseReturnDetail::class, 'purchase_return_detail_id');
    }

    public function sales_order_detail()
    {
        return $this->belongsTo(SalesOrderDetail::class, 'sales_order_detail_id');
    }

    public function sales_order_return_detail()
    {
        return $this->belongsTo(SalesOrderReturnDetail::class, 'sales_order_return_detail_id');
    }

    public function transfer_detail()
    {
        return $this->belongsTo(TransferDetail::class, 'transfer_detail_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('warehouse_id')) {
            $query->addBinding([$request->warehouse_id, $request->warehouse_id], 'select');
        }

        return $query;
    }
}
