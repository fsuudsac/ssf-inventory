<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RefDepartmentAllocation extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function ref_department()
    {
        return $this->belongsTo(RefDepartment::class, 'department_id');
    }

    public function ref_school_year()
    {
        return $this->belongsTo(RefSchoolYear::class, 'school_year_id');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('department_type_id')) {
            $query->whereHas('ref_department', function ($query) use ($request) {
                $query->where('department_type_id', $request->department_type_id);
            });
        }

        if ($request->filled('school_year_id')) {
            $query->where('school_year_id', $request->school_year_id);
        }

        return $query;
    }
}
