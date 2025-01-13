<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Head extends Model
{
    use HasFactory;

    protected $table = 'head';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'department',
        'status',
    ];

    protected $hidden = [
        'password',
    ];
}
