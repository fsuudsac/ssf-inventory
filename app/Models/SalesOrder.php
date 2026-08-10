<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesOrder extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function sales_order_details()
    {
        return $this->hasMany(SalesOrderDetail::class, 'sales_order_id');
    }

    public function sales_order_warranties()
    {
        return $this->hasMany(SalesOrderWarranty::class, 'sales_order_id');
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

    public function sales_payments()
    {
        return $this->hasMany(UserPayment::class, 'sales_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('date_transaction_format')) {
            $filteredReleaseItemDate = explode(',', $request->date_transaction_format);

            if (count($filteredReleaseItemDate) == 2) {
                $query->where('created_at', '>=', trim($filteredReleaseItemDate[0]))
                    ->where('created_at', '<=', trim($filteredReleaseItemDate[1]));
            }
        }

        if ($request->filled('from')) {
            if ($request->from == 'DashboardPaymentDueList') {
                $query->where('paid_status', 'Not Paid');

                $query->whereDate('date_due', '<=', Carbon::now()->addDays(3)->format('Y-m-d'));
            }
        }

        if ($request->filled('type')) {
            if ($request->type == 'Release Item') {
                $query->where('type', 'Release Item');
            } else if ($request->type == 'Release Item Return') {
                $query->where('type', 'Release Item Returned');
            }
        }

        return $query;
    }
}
