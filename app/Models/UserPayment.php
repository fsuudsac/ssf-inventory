<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPayment extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, "user_id");
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('sales_id')) {
            $query->where('sales_id', $request->sales_id);
        }

        if ($request->filled('purchase_id')) {
            $query->where('purchase_id', $request->purchase_id);
        }

        if ($request->filled('date_sales_string')) {
            $date_sales_string = explode(',', $request->date_sales_string);

            $query->whereBetween('created_at', [$date_sales_string[0], $date_sales_string[1]]);
        }

        return $query;
    }
}
