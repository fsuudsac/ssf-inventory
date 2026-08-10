<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RefDepartment extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function profile_departments()
    {
        return $this->hasMany(ProfileDepartment::class, 'department_id');
    }

    public function ref_department_type()
    {
        return $this->belongsTo(RefDepartmentType::class, 'department_type_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('department_type_id')) {
            $query->where('department_type_id', $request->department_type_id);
        }

        return $query;
    }
}
