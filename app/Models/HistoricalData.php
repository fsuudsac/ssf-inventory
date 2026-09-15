<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoricalData extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function historicalable()
    {
        return $this->morphTo('historicalable');
    }

    // --- Relationships for each historicalable type ---

    public function company()
    {
        return $this->belongsTo(Company::class, 'historicalable_id')
            ->where('historicalable_type', Company::class);
    }

    public function credit_term()
    {
        return $this->belongsTo(CreditTerm::class, 'historicalable_id')
            ->where('historicalable_type', CreditTerm::class);
    }

    public function ewt_type()
    {
        return $this->belongsTo(EwtType::class, 'historicalable_id')
            ->where('historicalable_type', EwtType::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'historicalable_id')
            ->where('historicalable_type', Product::class);
    }

    public function product_category()
    {
        return $this->belongsTo(ProductCategory::class, 'historicalable_id')
            ->where('historicalable_type', ProductCategory::class);
    }

    public function product_detail()
    {
        return $this->belongsTo(ProductDetail::class, 'historicalable_id')
            ->where('historicalable_type', ProductDetail::class);
    }

    public function product_detail_price()
    {
        return $this->belongsTo(ProductDetailPrice::class, 'historicalable_id')
            ->where('historicalable_type', ProductDetailPrice::class);
    }

    public function product_size()
    {
        return $this->belongsTo(ProductSize::class, 'historicalable_id')
            ->where('historicalable_type', ProductSize::class);
    }

    public function product_type()
    {
        return $this->belongsTo(ProductType::class, 'historicalable_id')
            ->where('historicalable_type', ProductType::class);
    }

    public function profile_address()
    {
        return $this->belongsTo(ProfileAddress::class, 'historicalable_id')
            ->where('historicalable_type', ProfileAddress::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'historicalable_id')
            ->where('historicalable_type', Purchase::class);
    }

    public function purchase_detail()
    {
        return $this->belongsTo(PurchaseDetail::class, 'historicalable_id')
            ->where('historicalable_type', PurchaseDetail::class);
    }

    public function purchase_return()
    {
        return $this->belongsTo(PurchaseReturn::class, 'historicalable_id')
            ->where('historicalable_type', PurchaseReturn::class);
    }

    public function ref_department()
    {
        return $this->belongsTo(RefDepartment::class, 'historicalable_id')
            ->where('historicalable_type', RefDepartment::class);
    }

    public function ref_department_allocation()
    {
        return $this->belongsTo(RefDepartmentAllocation::class, 'historicalable_id')
            ->where('historicalable_type', RefDepartmentAllocation::class);
    }

    public function ref_department_type()
    {
        return $this->belongsTo(RefDepartmentType::class, 'historicalable_id')
            ->where('historicalable_type', RefDepartmentType::class);
    }

    public function sales_order()
    {
        return $this->belongsTo(SalesOrder::class, 'historicalable_id')
            ->where('historicalable_type', SalesOrder::class);
    }

    public function sales_order_detail()
    {
        return $this->belongsTo(SalesOrderDetail::class, 'historicalable_id')
            ->where('historicalable_type', SalesOrderDetail::class);
    }

    public function sales_order_return()
    {
        return $this->belongsTo(SalesOrderReturn::class, 'historicalable_id')
            ->where('historicalable_type', SalesOrderReturn::class);
    }

    public function sales_order_warranty()
    {
        return $this->belongsTo(SalesOrderWarranty::class, 'historicalable_id')
            ->where('historicalable_type', SalesOrderWarranty::class);
    }

    public function transfer()
    {
        return $this->belongsTo(Transfer::class, 'historicalable_id')
            ->where('historicalable_type', Transfer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'historicalable_id')
            ->where('historicalable_type', User::class);
    }

    public function user_role()
    {
        return $this->belongsTo(UserRole::class, 'historicalable_id')
            ->where('historicalable_type', UserRole::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'historicalable_id')
            ->where('historicalable_type', Warehouse::class);
    }

    // --- Filter scope ---

    public function scopeFilter($query, $request)
    {
        // Filter by one or more historicalable types (comma-separated)
        if ($request->filled('historicalable_type')) {
            $types = explode(',', $request->historicalable_type);
            $query->whereIn('historicalable_type', $types);
        }

        // Filter by a specific record id (direct match on historicalable_id)
        if ($request->filled('historicalable_id')) {
            $query->where('historicalable_id', $request->historicalable_id);
        }

        // Filter Purchase / PurchaseDetail / PurchaseReturn history by supplier
        if ($request->filled('supplier_id')) {
            $query->where(function ($q) use ($request) {
                // Purchases directly owned by supplier
                $q->where(function ($sub) use ($request) {
                    $sub->where('historicalable_type', Purchase::class)
                        ->whereIn('historicalable_id', function ($subQ) use ($request) {
                            $subQ->select('id')->from('purchases')
                                ->where('supplier_id', $request->supplier_id);
                        });
                })
                // PurchaseDetails linked through purchases.supplier_id
                ->orWhere(function ($sub) use ($request) {
                    $sub->where('historicalable_type', PurchaseDetail::class)
                        ->whereIn('historicalable_id', function ($subQ) use ($request) {
                            $subQ->select('purchase_details.id')->from('purchase_details')
                                ->join('purchases', 'purchase_details.purchase_id', '=', 'purchases.id')
                                ->where('purchases.supplier_id', $request->supplier_id);
                        });
                })
                // PurchaseReturns linked through purchases.supplier_id
                ->orWhere(function ($sub) use ($request) {
                    $sub->where('historicalable_type', PurchaseReturn::class)
                        ->whereIn('historicalable_id', function ($subQ) use ($request) {
                            $subQ->select('purchase_returns.id')->from('purchase_returns')
                                ->join('purchases', 'purchase_returns.purchase_id', '=', 'purchases.id')
                                ->where('purchases.supplier_id', $request->supplier_id);
                        });
                });
            });
        }

        // Filter SalesOrder / SalesOrderDetail / SalesOrderReturn / SalesOrderWarranty history by customer
        if ($request->filled('customer_id')) {
            $query->where(function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('historicalable_type', SalesOrder::class)
                        ->whereIn('historicalable_id', function ($subQ) use ($request) {
                            $subQ->select('id')->from('sales_orders')
                                ->where('customer_id', $request->customer_id);
                        });
                })
                ->orWhere(function ($sub) use ($request) {
                    $sub->where('historicalable_type', SalesOrderDetail::class)
                        ->whereIn('historicalable_id', function ($subQ) use ($request) {
                            $subQ->select('sales_order_details.id')->from('sales_order_details')
                                ->join('sales_orders', 'sales_order_details.sales_order_id', '=', 'sales_orders.id')
                                ->where('sales_orders.customer_id', $request->customer_id);
                        });
                })
                ->orWhere(function ($sub) use ($request) {
                    $sub->where('historicalable_type', SalesOrderReturn::class)
                        ->whereIn('historicalable_id', function ($subQ) use ($request) {
                            $subQ->select('sales_order_returns.id')->from('sales_order_returns')
                                ->join('sales_orders', 'sales_order_returns.sales_order_id', '=', 'sales_orders.id')
                                ->where('sales_orders.customer_id', $request->customer_id);
                        });
                })
                ->orWhere(function ($sub) use ($request) {
                    $sub->where('historicalable_type', SalesOrderWarranty::class)
                        ->whereIn('historicalable_id', function ($subQ) use ($request) {
                            $subQ->select('sales_order_warranties.id')->from('sales_order_warranties')
                                ->join('sales_orders', 'sales_order_warranties.sales_order_id', '=', 'sales_orders.id')
                                ->where('sales_orders.customer_id', $request->customer_id);
                        });
                });
            });
        }

        // Filter RefDepartmentAllocation history by department
        // historicalable_id is the allocation id, not department_id — subquery required
        if ($request->filled('department_id')) {
            $query->where(function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('historicalable_type', RefDepartmentAllocation::class)
                        ->whereIn('historicalable_id', function ($subQ) use ($request) {
                            $subQ->select('id')->from('ref_department_allocations')
                                ->where('department_id', $request->department_id);
                        });
                })
                ->orWhere(function ($sub) use ($request) {
                    $sub->where('historicalable_type', RefDepartment::class)
                        ->where('historicalable_id', $request->department_id);
                });
            });
        }

        // Filter by subject (e.g. "Purchase", "Sales Order", "User")
        if ($request->filled('subject')) {
            $subjects = explode(',', $request->subject);
            $query->whereIn('subject', $subjects);
        }

        // Filter by module
        if ($request->filled('module')) {
            $modules = explode(',', $request->module);
            $query->whereIn('module', $modules);
        }

        // Filter by action (Create, Update, Delete)
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        return $query;
    }
}
