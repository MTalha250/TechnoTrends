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
        'remarksDate',
        'isDcDateEdited',
        'isJcDateEdited',
        'isQuotationDateEdited',
        'isRemarksDateEdited',
        'isPoDateEdited',
        'isDueDateEdited'

    ];

    protected $casts = [
        'photos' => 'array',
        'visitDates' => 'array',
        'jcReference' => 'array',
        'dcReference' => 'array',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'createdBy');
    }

    /*public function head()
    {
        return $this->belongsTo(Head::class, 'assignedHead');
    }*/

    public function users()
    {
        return $this->belongsToMany(User::class, 'complaints_assigned_to_users')->withTimestamps();
    }


    public function complaintAssignedUsers()
    {
        return $this->hasMany(complaintAssignedToUsers::class,'complaint_id');
    }
}
