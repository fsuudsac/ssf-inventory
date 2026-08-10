<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileAddress extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function profile()
    {
        return $this->belongsTo(Profile::class, "profile_id");
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->filled('profile_id')) {
            $query->where('profile_id', $request->profile_id);
        }

        return $query;
    }
}
