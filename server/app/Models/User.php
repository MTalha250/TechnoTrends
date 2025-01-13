<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    protected $table = 'user';

    protected $fillable = [
        'name',
        'email',
        'password',
        'head_id',
        'phone',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    public function head()
    {
        return $this->belongsTo(Head::class);
    }
}
