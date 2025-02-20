<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoryData extends Model
{
    protected $guarded = [];

    public function historyable()
    {
        return $this->morphTo();
    }
}