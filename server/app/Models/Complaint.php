<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaintReference',
        'complaintImage',
        'clientName',
        'clientPhone',
        'title',
        'description',
        'dueDate',
        'createdBy',
        'assignedHead',
        'jcReference',
        'jcImage',
        'photos',
        'priority',
        'remarks',
        'status',
        'poNumber',
        'poDate',
        'visitDates',
        'jcDate',
        'dcReference',
        'dcDate',
        'quotation',
        'quotationDate',
        'remarksDate'

    ];

    protected $casts = [
        'photos' => 'array',
        'visitDates' => 'array',
        'dueDate' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'createdBy');
    }

    public function head()
    {
        return $this->belongsTo(Head::class, 'assignedHead');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'complaints_assigned_to_users')->withTimestamps();
    }
}
