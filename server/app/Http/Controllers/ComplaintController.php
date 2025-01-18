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
            'complaintReference' => 'required|string|max:255', // required
            'complaintImage' => 'required|string|max:255', // required
            'clientName' => 'required|string|max:255', // required
            'clientPhone' => 'required|string|max:15', // required
            'title' => 'required|string|max:255', // required
            'description' => 'required|string', // required
            'dueDate' => 'nullable|date', // required
            'createdBy' => 'nullable|exists:admin,id', // required
            'assignedHead' => 'nullable|exists:head,id', // nullable
            'jcReference' => 'nullable|string|max:255', // nullable
            'jcImage' => 'nullable|string|max:255', // nullable
            'photos' => 'nullable|array', // nullable
            'priority' => 'required|in:Low,Medium,High', // required
            'remarks' => 'nullable|string', // nullable
            'status' => 'required|in:Pending,In Progress,Resolved,Closed', // required
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

    public function assignToHead(Request $request, $complaintId)
    {
        $validated = $request->validate([
            'head_id' => 'required|exists:head,id',
        ]);
    
        $complaint = Complaint::findOrFail($complaintId);
        $complaint->update(['assignedHead' => $validated['head_id']]);
    
        return response()->json([
            'message' => 'Complain assigned to head successfully',
            'Complain' => $complaint->load('head','users','admin'),
        ]);
    }
    
    public function assignToWorkers(Request $request, $complaintId)
    {
        $validated = $request->validate([
            'worker_ids' => 'required|array',
            'worker_ids.*' => 'exists:user,id',
        ]);
    
        $complaint = Complaint::findOrFail($complaintId);
        $complaint->users()->sync($validated['worker_ids']);
    
        return response()->json([
            'message' => 'Complain assigned to workers successfully',
            'Complain' => $complaint->load('head','users','admin'),
        ]);
    }
    
}
