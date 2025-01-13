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
        'assigned_by_admin',
        'assigned_by_head',
        'remarks',
        'dueDate',
    ];

    protected $casts = [
        'surveyPhotos' => 'array',
        'dueDate' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'assigned_by_admin');
    }

    public function head()
    {
        return $this->belongsTo(Head::class, 'assigned_by_head');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'project_assigned_to_users');
    }
}
