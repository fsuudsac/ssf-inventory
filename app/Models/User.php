<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, ModelTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'firstname',
        'middlename',
        'lastname',
        'name_ext',
        'gender',
        'contact_no',
        'address',
        'role',
        'status',
        'one_time_update_info',
        'google2fa_enable',
        'google2fa_secret',
        'remember_token',
        'created_by',
        'updated_by',
        'deactivated_by',
        'deactivated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profile()
    {
        return $this->hasOne(Profile::class, 'user_id');
    }

    public function sales_orders()
    {
        return $this->hasMany(SalesOrder::class, "customer_id");
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, "supplier_id");
    }

    public function company()
    {
        return $this->belongsTo(Company::class, "company_id");
    }

    public function user_payments()
    {
        return $this->hasMany(UserPayment::class, "user_id");
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachmentable');
    }

    public function historicalData()
    {
        return $this->morphMany(HistoricalData::class, 'historicalable');
    }

    public function scopeFilter($query, $request)
    {
        return $query;
    }
}
