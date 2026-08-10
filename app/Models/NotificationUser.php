<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationUser extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function notification()
    {
        return $this->belongsTo(Notification::class, "notification_id");
    }

    public function user()
    {
        return $this->belongsTo(User::class, "user_id");
    }

    public function scopeFilter($query, $request)
    {
        return $query;
    }
}
