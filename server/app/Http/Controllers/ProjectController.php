<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Invoice;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with(['admin', 'users', 'projectAssignedUsers'])->orderBy('created_at', 'desc')->get();
        
        $projects->each(function ($project) {
            $project->users = $project->users->map(function ($user) use ($project) {
                $assignedUser = $project->projectAssignedUsers->firstWhere('user_id', $user->id);
                
                if ($assignedUser) {
                    $user->statusByUser = $assignedUser->statusByUser;
                    $user->reason = $assignedUser->reason;
                }
    
                $user->makeHidden(['pivot', 'remember_token']);
                
                return $user;
            });
    
            $project->makeHidden(['projectAssignedUsers']);
        });
    
        return response()->json($projects);
    }
    

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'poNumber' => 'nullable|string',
            'poImage' => 'nullable|string',
            'clientName' => 'nullable|string',
            'clientPhone' => 'nullable|string',
            'surveyPhotos' => 'nullable|array',
            'quotationReference' => 'nullable|string',
            'quotationImage' => 'nullable|string',
            'jcReference' => 'nullable|array',
            'jcImage' => 'nullable|string',
            'dcReference' => 'nullable|array',
            'dcImage' => 'nullable|string',
            'status' => 'nullable|string|in:Pending,In Progress,On Hold,Completed,Cancelled',
            'assignedBy' => 'nullable|exists:admin,id',
            'remarks' => 'nullable|string',
            'dueDate' => 'nullable|date',
            'poDate' => 'nullable|string',
            'surveyDate' => 'nullable|string',
            'quotationDate' => 'nullable|string',
            'jcDate' => 'nullable|string',
            'dcDate' => 'nullable|string',
            'remarksDate' => 'nullable|string',
        ]);
    
        if ($request->has('poNumber'&& !empty($request->input('poNumber')))) {
            $validated['poDate'] = $request->input('poDate') ?: now();  
        }
    
        if ($request->has('jcReference'&& !empty($request->input('jcReference')))) {
            $validated['jcDate'] = $request->input('jcDate') ?: now();  
        }
    
        if ($request->has('dcReference')&& !empty($request->input('dcReference'))) {
            $validated['dcDate'] = $request->input('dcDate') ?: now();  
        }
    
        if ($request->has('remarks')&& !empty($request->input('remarks'))) {
            $validated['remarksDate'] = $request->input('remarksDate') ?: now();
        }

        if ($request->has('surveyPhotos')&& !empty($request->input('surveyPhotos'))) {
            $validated['surveyDate'] = $request->input('surveyDate') ?: now();
        }
    
        if ($request->has('quotationReference')&& !empty($request->input('quotationReference'))) {
            $validated['quotationDate'] = $request->input('quotationDate') ?: now();  
        }
    
        $project = Project::create($validated);
    
        if ($request->has('assignedWorkers')) {
            $project->users()->attach($request->assignedWorkers);
        }
    
        $project = $project->load(['admin', 'users']);
    
        $project->users->each(function ($user) {
            $user->makeHidden(['pivot', 'remember_token']);
        });
    
        return response()->json($project, 201);
    }
    
    public function show($id)
    {
        $project = Project::with(['admin', 'users', 'projectAssignedUsers'])->findOrFail($id);
    
        $project->users = $project->users->map(function ($user) use ($project) {
            $assignedUser = $project->projectAssignedUsers->firstWhere('user_id', $user->id);
    
            if ($assignedUser) {
                $user->statusByUser = $assignedUser->statusByUser;
                $user->reason = $assignedUser->reason;
            }
    
            $user->makeHidden(['pivot', 'remember_token']);
            
            return $user;
        });
    
        $project->makeHidden(['projectAssignedUsers']);
    
        return response()->json($project);
    }
    
    

    public function update(Request $request, $id)
    {
        try {
            $project = Project::findOrFail($id);
        
            $validated = $request->validate([
                'description' => 'nullable|string',
                'poNumber' => 'nullable|string',
                'poImage' => 'nullable|string',
                'clientName' => 'nullable|string',
                'clientPhone' => 'nullable|string',
                'surveyPhotos' => 'nullable|array',
                'quotationReference' => 'nullable|string',
                'quotationImage' => 'nullable|string',
                'jcReference' => 'nullable|array',
                'jcImage' => 'nullable|string',
                'dcReference' => 'nullable|array',
                'dcImage' => 'nullable|string',
                'status' => 'nullable|string|in:Pending,In Progress,On Hold,Completed,Cancelled',
                'assignedBy' => 'nullable|exists:admin,id',
                'remarks' => 'nullable|string',
                'dueDate' => 'nullable|string',
                'poDate' => 'nullable|string',
                'surveyDate' => 'nullable|string',
                'quotationDate' => 'nullable|string',
                'jcDate' => 'nullable|string',
                'dcDate' => 'nullable|string',
                'remarksDate' => 'nullable|string',
            ]);
        
            // Automatically set poDate if poNumber is provided
            if ($request->has('poNumber') && !empty($request->input('poNumber'))) {
                if (empty($project->poDate) && !$request->has('poDate')) {
                    $validated['poDate'] = now();
                }
            }
            if ($request->has('poDate')) {
                $validated['poDate'] = $request->input('poDate');
                $validated['isPoDateEdited'] = true;
            }
    
            // Automatically set jcDate if jcReference is provided
            if ($request->has('jcReference') && !empty($request->input('jcReference'))) {
                if (empty($project->jcDate) && !$request->has('jcDate')) {
                    $validated['jcDate'] = now();
                    $validated['status'] = 'Completed';  
                }
            }
            if ($request->has('jcDate')) {
                $validated['jcDate'] = $request->input('jcDate');
                $validated['status'] = 'Completed';  
                $validated['isJcDateEdited'] = true;
            }
    
            // Automatically set dcDate if dcReference is provided
            if ($request->has('dcReference') && !empty($request->input('dcReference'))) {
                if (empty($project->dcDate) && !$request->has('dcDate')) {
                    $validated['dcDate'] = now();
                    $validated['status'] = 'Completed';  
                }
            }
            if ($request->has('dcDate')) {
                $validated['dcDate'] = $request->input('dcDate');
                $validated['status'] = 'Completed';  
                $validated['isDcDateEdited'] = true;
            }
    
            // Automatically set surveyDate if survey photos is provided
            if ($request->has('surveyPhotos') && !empty($request->input('surveyPhotos'))) {
                if (empty($project->surveyDate) && !$request->has('surveyDate')) {
                    $validated['surveyDate'] = now();
                }
            }
            if ($request->has('surveyDate')) {
                $validated['surveyDate'] = $request->input('surveyDate');
                $validated['isSurveyDateEdited'] = true;
            }
    
            // Automatically set remarksDate if remarks is provided
            if ($request->has('remarks') && !empty($request->input('remarks'))) {
                if (empty($project->remarksDate) && !$request->has('remarksDate')) {
                    $validated['remarksDate'] = now();
                }
            }
            if ($request->has('remarksDate')) {
                $validated['remarksDate'] = $request->input('remarksDate');
                $validated['isRemarksDateEdited'] = true;
            }
    
            // Automatically set quotationDate if quotationReference is provided
            if ($request->has('quotationReference') && !empty($request->input('quotationReference'))) {
                if (empty($project->quotationDate) && !$request->has('quotationDate')) {
                    $validated['quotationDate'] = now();
                }
            }
            if ($request->has('quotationDate')) {
                $validated['quotationDate'] = $request->input('quotationDate');
                $validated['isQuotationDateEdited'] = true;
            }
    
            if ($request->has('dueDate')) {
                $validated['dueDate'] = $request->input('dueDate');
                $validated['isDueDateEdited'] = true;
            }
            
            $validated = array_filter($validated, function ($value) {
                return !is_null($value) && $value !== '';
            });
    
            $project->update($validated);
    
            if ($request->has('assignedWorkers')) {
                $project->users()->sync($request->assignedWorkers);
            }
    
            $existingInvoice = Invoice::where('linkedProject', $project->id)->first();
    
            if (!$existingInvoice && ($request->has('jcReference') || $request->has('dcReference'))) {
                Invoice::create([
                    'linkedProject' => $project->id,
                    'clientName' => $project->clientName,
                    'poNumber' => $project->poNumber,
                    'poDate' => $project->poDate,
                    'jcReference' => $validated['jcReference'] ?? null,
                    'jcDate' => $validated['jcDate'] ?? null,
                    'dcReference' => $validated['dcReference'] ?? null,
                    'dcDate' => $validated['dcDate'] ?? null,
                    'invoiceDate' => now(),
                    'status' => 'Pending',
                ]);
            }
    
            return response()->json(
                $project->load(['admin', 'users'])->makeHidden(['pivot', 'remember_token'])
            );
    
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Project not found.'], 404);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed.', 'details' => $e->errors()], 422);
    
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['error' => 'Database error occurred.', 'message' => $e->getMessage()], 500);
    
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred.', 'message' => $e->getMessage()], 500);
        }
    }
    

    
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }

/*    public function assignToHead(Request $request, $projectId)
{
    $validated = $request->validate([
        'head_id' => 'required|exists:head,id',
    ]);

    $project = Project::findOrFail($projectId);
    $project->update(['assignedHead' => $validated['head_id']]);

    return response()->json([
        'message' => 'Project assigned to head successfully',
        'project' => $project->load('head','users','admin')->makeHidden(['pivot', 'remember_token']),
    ]);
}*/
public function assignToWorkers(Request $request, $projectId)
{
    $validated = $request->validate([
        'worker_ids' => 'required|array',
        'worker_ids.*' => 'exists:user,id',
    ]);

    $project = Project::findOrFail($projectId);
    $project->users()->sync($validated['worker_ids']);

    return response()->json([
        'message' => 'Project assigned to workers successfully',
        'project' => $project->load('users','admin')->makeHidden(['pivot', 'remember_token']),
    ]);
}


}
