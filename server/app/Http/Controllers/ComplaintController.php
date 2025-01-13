<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function index()
    {
        $complaints = Complaint::with(['admin', 'head', 'users'])->get();
        return response()->json($complaints);
    }

    public function store(Request $request)
    {
        $request->validate([
            'complaintReference' => 'required|string|max:255',
            'complaintImage' => 'required|string|max:255',
            'clientName' => 'required|string|max:255',
            'clientPhone' => 'required|string|max:15',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'dueDate' => 'nullable|date',
            'createdBy' => 'nullable|exists:admin,id',
            'assignedHead' => 'nullable|exists:head,id',
            'jcReference' => 'required|string|max:255',
            'jcImage' => 'required|string|max:255',
            'photos' => 'required|array',
            'priority' => 'required|in:Low,Medium,High',
            'remarks' => 'nullable|string',
            'status' => 'required|in:Pending,In Progress,Resolved,Closed',
        ]);

        $complaint = Complaint::create($request->all());

        if ($request->has('assignedWorkers')) {
            $complaint->users()->sync($request->assignedWorkers);
        }

        return response()->json($complaint->load(['admin', 'head', 'users']), 201);
    }

    public function show($id)
    {
        $complaint = Complaint::with(['admin', 'head', 'users'])->findOrFail($id);
        return response()->json($complaint);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'complaintReference' => 'string|max:255',
            'complaintImage' => 'string|max:255',
            'clientName' => 'string|max:255',
            'clientPhone' => 'string|max:15',
            'title' => 'string|max:255',
            'description' => 'string',
            'dueDate' => 'nullable|date',
            'createdBy' => 'nullable|exists:admin,id',
            'assignedHead' => 'nullable|exists:head,id',
            'jcReference' => 'string|max:255',
            'jcImage' => 'string|max:255',
            'photos' => 'array',
            'priority' => 'in:Low,Medium,High',
            'remarks' => 'string',
            'status' => 'in:Pending,In Progress,Resolved,Closed',
        ]);

        $complaint = Complaint::findOrFail($id);
        $complaint->update($request->all());

        if ($request->has('assignedWorkers')) {
            $complaint->users()->sync($request->assignedWorkers);
        }

        return response()->json($complaint->load(['admin', 'head', 'users']));
    }

    public function destroy($id)
    {
        $complaint = Complaint::findOrFail($id);
        $complaint->delete();
        return response()->json(['message' => 'Complaint deleted successfully.']);
    }
}
