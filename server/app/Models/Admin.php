<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'admin';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'status',
    ];

    protected $hidden = [
        'password',
    ];
    public function complaints()
{
    return $this->hasMany(Complaint::class, 'createdByAdmin');
}

public function projects()
{
    return $this->hasMany(Project::class, 'assigned_by_admin');
}

}
