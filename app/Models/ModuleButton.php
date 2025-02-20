<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleButton extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function module()
    {
        return $this->belongsTo(Module::class, "module_id");
    }

    public function user_role_permissions()
    {
        return $this->hasMany(UserRolePermission::class, "mod_button_id");
    }
}
