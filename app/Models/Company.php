<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function profiles()
    {
        return $this->hasMany(Profile::class, 'company_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'company_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('role')) {
            $role = explode(',', $request->role);
            $query->whereIn('role', $role);
        }

        if ($request->filled('status')) {
            if ($request->status != 'Active') {
                $query->whereNotNull('deactivated_at');
            }
        }

        return $query;
    }
}
