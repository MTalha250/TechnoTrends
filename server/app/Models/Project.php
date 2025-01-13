<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'poNumber',
        'poImage',
        'clientName',
        'clientPhone',
        'surveyPhotos',
        'quotationReference',
        'quotationImage',
        'jcReference',
        'jcImage',
        'dcReference',
        'dcImage',
        'status',
        'assignedBy',
        'assignedHead',
        'remarks',
        'dueDate',
    ];

    protected $casts = [
        'surveyPhotos' => 'array',
        'dueDate' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'assignedBy');
    }

    public function head()
    {
        return $this->belongsTo(Head::class, 'assignedHead');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'project_assigned_to_users');
    }
}
