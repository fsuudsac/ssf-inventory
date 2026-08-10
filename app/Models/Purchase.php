<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function purchase_details()
    {
        return $this->hasMany(PurchaseDetail::class, 'purchase_id');
    }

    public function profile_address()
    {
        return $this->belongsTo(ProfileAddress::class, 'profile_address_id');
    }

    public function ewt_type()
    {
        return $this->belongsTo(EwtType::class, 'ewt_type_id');
    }

    public function credit_term()
    {
        return $this->belongsTo(CreditTerm::class, 'credit_term_id');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function purchase_payments()
    {
        return $this->hasMany(UserPayment::class, 'purchase_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_purchased_format')) {
            $filteredPurchasedOrderDate = explode(',', $request->date_purchased_format);

            if (count($filteredPurchasedOrderDate) == 2) {
                $query->where('date_purchased', '>=', trim($filteredPurchasedOrderDate[0]))
                    ->where('date_purchased', '<=', trim($filteredPurchasedOrderDate[1]));
            }
        }

        if ($request->filled('from')) {
            $query->where('paid_status', 'Not Paid');
            $query->whereDate('date_due', '<=', Carbon::now()->addDays(3)->format('Y-m-d'));
        }

        return $query;
    }
}
