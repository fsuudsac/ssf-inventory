<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseReturn extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }

    public function purchase_return_details()
    {
        return $this->hasMany(PurchaseReturnDetail::class, 'purchase_return_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('date_return')) {
            $filteredPurchaseReturnDate = explode(',', $request->date_return);

            if (count($filteredPurchaseReturnDate) == 2) {
                $query->where('date_return', '>=', trim($filteredPurchaseReturnDate[0]))
                    ->where('date_return', '<=', trim($filteredPurchaseReturnDate[1]));
            }
        }

        return $query;
    }
}
