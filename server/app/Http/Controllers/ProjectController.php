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
        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255', // required
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
        ]);

        $project = Project::create($validated);
        if ($request->has('assignedWorkers')) {
            $project->users()->attach($request->assignedWorkers);
        }

        return response()->json($project->load(['admin', 'head', 'users']), 201);
    }

    public function show($id)
    {
        $project = Project::with(['admin', 'head', 'users'])->findOrFail($id);
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
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
        ]);

        $project->update($validated);

        if ($request->has('assignedWorkers')) {
            $project->users()->sync($request->assignedWorkers);
        }

        return response()->json($project->load(['admin', 'head', 'users']));
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
        'project' => $project->load('head','users','admin'),
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
        'project' => $project->load('users','head','admin'),
    ]);
}


}
