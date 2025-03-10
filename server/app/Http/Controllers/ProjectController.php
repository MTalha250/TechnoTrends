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
        $projects = Project::with(['admin', 'head', 'users'])->get();
        $projects->each(function ($project) {
            $project->users->makeHidden(['pivot', 'remember_token']);
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
            'jcReference' => 'nullable|string',
            'jcImage' => 'nullable|string',
            'dcReference' => 'nullable|string',
            'dcImage' => 'nullable|string',
            'status' => 'nullable|string|in:Pending,In Progress,On Hold,Completed,Cancelled',
            'assignedBy' => 'nullable|exists:admin,id',
            'assignedHead' => 'nullable|exists:head,id',
            'remarks' => 'nullable|string',
            'dueDate' => 'nullable|date',
            'poDate' => 'nullable|string',
            'surveyDate' => 'nullable|string',
            'quotationDate' => 'nullable|string',
            'jcDate' => 'nullable|string',
            'dcDate' => 'nullable|string',
            'remarksDate' => 'nullable|string',
        ]);
    
        if ($request->has('poNumber')) {
            $validated['poDate'] = $request->input('poDate') ?: now();  
        }
    
        if ($request->has('jcReference')) {
            $validated['jcDate'] = $request->input('jcDate') ?: now();  
        }
    
        if ($request->has('dcReference')) {
            $validated['dcDate'] = $request->input('dcDate') ?: now();  
        }
    
        if ($request->has('remarks')) {
            $validated['remarksDate'] = $request->input('remarksDate') ?: now();
        }

        if ($request->has('surveyPhotos')) {
            $validated['surveyDate'] = $request->input('surveyDate') ?: now();
        }
    
        if ($request->has('quotationReference')) {
            $validated['quotationDate'] = $request->input('quotationDate') ?: now();  
        }
    
        $project = Project::create($validated);
    
        if ($request->has('assignedWorkers')) {
            $project->users()->attach($request->assignedWorkers);
        }
    
        // Load the relationships and hide pivot and remember_token fields
        $project = $project->load(['admin', 'head', 'users']);
    
        $project->users->each(function ($user) {
            $user->makeHidden(['pivot', 'remember_token']);
        });
    
        return response()->json($project, 201);
    }
    
    public function show($id)
    {
        $project = Project::with(['admin', 'head', 'users'])->findOrFail($id);
        $project->users->makeHidden(['pivot', 'remember_token']);  
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
    
        // Validate the incoming request
        $validated = $request->validate([
            'description' => 'sometimes|string',
            'poNumber' => 'sometimes|string',
            'poImage' => 'sometimes|string',
            'clientName' => 'sometimes|string',
            'clientPhone' => 'sometimes|string',
            'surveyPhotos' => 'sometimes|array',
            'quotationReference' => 'sometimes|string',
            'quotationImage' => 'sometimes|string',
            'jcReference' => 'sometimes|string',
            'jcImage' => 'sometimes|string',
            'dcReference' => 'sometimes|string',
            'dcImage' => 'sometimes|string',
            'status' => 'sometimes|string|in:Pending,In Progress,On Hold,Completed,Cancelled',
            'assignedBy' => 'sometimes|exists:admin,id',
            'assignedHead' => 'sometimes|exists:head,id',
            'remarks' => 'sometimes|string',
            'dueDate' => 'sometimes|date',
            'poDate' => 'sometimes|string',
            'surveyDate' => 'sometimes|string',
            'quotationDate' => 'sometimes|string',
            'jcDate' => 'sometimes|string',
            'dcDate' => 'sometimes|string',
            'remarksDate' => 'sometimes|string',
        ]);
    
        // Automatically set poDate if poNumber is provided
        if ($request->has('poNumber')) {
            $validated['poDate'] = $request->input('poDate') ?: now();  // Set to current date if no poDate provided
        }
    
        // Automatically set jcDate if jcReference is provided
        if ($request->has('jcReference')) {
            $validated['jcDate'] = $request->input('jcDate') ?: now();  // Set to current date if no jcDate provided
        }
    
        // Automatically set dcDate if dcReference is provided
        if ($request->has('dcReference')) {
            $validated['dcDate'] = $request->input('dcDate') ?: now();  // Set to current date if no dcDate provided
        }
        if ($request->has('surveyPhotos')) {
            $validated['surveyDate'] = $request->input('surveyDate') ?: now();
        }
    
        // Automatically set remarksDate if remarks is provided
        if ($request->has('remarks')) {
            $validated['remarksDate'] = $request->input('remarksDate') ?: now();  // Set to current date if no remarksDate provided
        }
    
        // Automatically set quotationDate if quotationReference is provided
        if ($request->has('quotationReference')) {
            $validated['quotationDate'] = $request->input('quotationDate') ?: now();  // Set to current date if no quotationDate provided
        }
    
        // Update the project with validated data
        $project->update($validated);
    
        // If workers are assigned, sync them with the project
        if ($request->has('assignedWorkers')) {
            $project->users()->sync($request->assignedWorkers);
        }

        if ($request->has('jcReference') || $request->has('dcReference')) {
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
        
    
        return response()->json($project->load(['admin', 'head', 'users'])->makeHidden(['pivot', 'remember_token']));
    }
    
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function assignToHead(Request $request, $projectId)
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
}

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
        'project' => $project->load('users','head','admin')->makeHidden(['pivot', 'remember_token']),
    ]);
}


}
