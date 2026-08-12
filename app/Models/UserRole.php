<?php

namespace App\Models;

use App\Models\User;
use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserRole extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function users()
    {
        return $this->hasMany(User::class, "user_role_id");
    }

    public function scopeFilter($query, $request)
    {
        if ($request->roles) {
            $roles = explode(',', $request->roles);
            $query->whereIn('role', $roles);
        }

        if ($request->withTrashed && $request->withTrashed == 'true') {
            $query->withTrashed();
        }

        return $query;
    }
}
