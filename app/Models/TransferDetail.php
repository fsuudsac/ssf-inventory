<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferDetail extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function product_detail()
    {
        return $this->belongsTo(ProductDetail::class, 'product_detail_id');
    }

    public function transfer()
    {
        return $this->belongsTo(Transfer::class, 'transfer_id');
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
