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
        $validated=$request->validate([
            'complaintReference' => 'nullable|string|max:255', // required
            'complaintImage' => 'nullable|string|max:255', // required
            'clientName' => 'nullable|string|max:255', // required
            'clientPhone' => 'nullable|string|max:15', // required
            'title' => 'nullable|string|max:255', // required
            'description' => 'nullable|string', // required
            'dueDate' => 'nullable|date', // required
            'createdBy' => 'nullable|exists:admin,id', // required
            'assignedHead' => 'nullable|exists:head,id', // nullable
            'jcReference' => 'nullable|string|max:255', // nullable
            'jcImage' => 'nullable|string|max:255', // nullable
            'photos' => 'nullable|array', // nullable
            'priority' => 'nullable|in:Low,Medium,High', // required
            'remarks' => 'nullable|string', // nullable
            'status' => 'nullable|in:Pending,In Progress,Completed,Cancelled', // required
            'poNumber' => 'nullable|string|max:255', // nullable
            'poDate' => 'nullable|string', // nullable
            'visitDates' => 'nullable|array', // nullable
            'jcDate' => 'nullable|string', // nullable
            'dcReference' => 'nullable|string|max:255', // nullable
            'dcDate' => 'nullable|string', // nullable
            'quotation' => 'nullable|string', // nullable
            'quotationDate' => 'nullable|string', // nullable
            'remarksDate' => 'nullable|string', // nullable
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
        if ($request->has('quotation')) {
            $validated['quotationDate'] = $request->input('quotationDate') ?: now();  
        }
        

        $complaint = Complaint::create($validated);

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
        $complaint = Complaint::findOrFail($id);

        $validated=$request->validate([
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
            'poNumber' => 'string|max:255',
            'poDate' => 'string',
            'visitDates' => 'array',
            'jcDate' => 'string',
            'dcReference' => 'string|max:255',
            'dcDate' => 'string',
            'quotation' => 'string',
            'quotationDate' => 'string',
            'remarksDate' => 'string',

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
        if ($request->has('quotation')) {
            $validated['quotationDate'] = $request->input('quotationDate') ?: now();  
        }

        $complaint->update($validated);

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
