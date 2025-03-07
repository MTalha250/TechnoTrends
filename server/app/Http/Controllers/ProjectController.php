<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

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
            'description' => 'required|string', // required
            'poNumber' => 'required|string', // required
            'poImage' => 'required|string', // required
            'clientName' => 'required|string', // required
            'clientPhone' => 'required|string', // required
            'surveyPhotos' => 'required|array', // required
            'quotationReference' => 'required|string', // required
            'quotationImage' => 'required|string', // required
            'jcReference' => 'nullable|string',  // nullable
            'jcImage' => 'nullable|string', // nullable
            'dcReference' => 'nullable|string', // nullable
            'dcImage' => 'nullable|string', // nullable
            'status' => 'required|string|in:Pending,In Progress,On Hold,Completed,Cancelled', // required
            'assignedBy' => 'required|exists:admin,id', // required
            'assignedHead' => 'nullable|exists:head,id', // nullable
            'remarks' => 'nullable|string', // nullable
            'dueDate' => 'required|date', // required
            'poDate' => 'nullable|string', // nullable
            'surveyDate' => 'nullable|string', // nullable
            'quotationDate' => 'nullable|string', // nullable
            'jcDate' => 'nullable|string', // nullable
            'dcDate' => 'nullable|string', // nullable
            'remarksDate' => 'nullable|string', // nullable

        ]);

        $project = Project::create($validated);

        // If workers are assigned, attach them to the project
        if ($request->has('assignedWorkers')) {
            $project->users()->attach($request->assignedWorkers);
        }
    
        // Load the relationships and hide pivot and remember_token fields
        $project = $project->load(['admin', 'head', 'users']);
    
        // Make sure to hide the pivot and remember_token fields from users
        $project->users->each(function ($user) {
            $user->makeHidden(['pivot', 'remember_token']);
        });
    
        // Return the response with the cleaned-up data
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

        $project->update($validated);

        if ($request->has('assignedWorkers')) {
            $project->users()->sync($request->assignedWorkers);
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
