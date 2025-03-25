<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;


class ComplaintController extends Controller
{
    public function index()
    {
        $complaints = Complaint::with(['admin', 'complaintAssignedUsers'])->orderBy('created_at', 'desc')->get();
        
        $complaints->each(function ($complaint) {
            $complaint->users = collect($complaint->complaintAssignedUsers)->map(function ($assignedUser) {
                $user = User::find($assignedUser->user_id);
        
                if ($user) {
                    $user->statusByUser = $assignedUser->statusByUser;
                    $user->reason = $assignedUser->reason;
                    $user->makeHidden(['pivot', 'remember_token']); 
                }
        
                return $user;
            });
    
            $complaint->makeHidden(['complaintAssignedUsers']);
        });
    
        return response()->json($complaints);
    }
    
    public function store(Request $request)
    {
        try {
            // Validate the incoming request
            $validated = $request->validate([
                'complaintReference' => 'nullable|string|max:255',
                'complaintImage' => 'nullable|string|max:255',
                'clientName' => 'nullable|string|max:255',
                'clientPhone' => 'nullable|string|max:15',
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'dueDate' => 'nullable|string',
                'createdBy' => 'nullable|exists:admin,id',
                'jcReference' => 'nullable|array',
                'jcImage' => 'nullable|string|max:255',
                'photos' => 'nullable|array',
                'priority' => 'nullable|in:Low,Medium,High',
                'remarks' => 'nullable|string',
                'status' => 'nullable|string',
                'poNumber' => 'nullable|string|max:255',
                'poDate' => 'nullable|string',
                'visitDates' => 'nullable|array',
                'jcDate' => 'nullable|string',
                'dcReference' => 'nullable|array',
                'dcDate' => 'nullable|string',
                'quotation' => 'nullable|string',
                'quotationDate' => 'nullable|string',
                'remarksDate' => 'nullable|string',
            ]);

            // Handle PO-related logic
            if ($request->has('poNumber') && !empty($request->input('poNumber'))) {
                $validated['poDate'] = $request->input('poDate') ?: now();
            }

            // Handle JC-related logic
            if ($request->has('jcReference') && !empty($request->input('jcReference'))) {
                $validated['jcDate'] = $request->input('jcDate') ?: now();
                $validated['status'] = 'Completed';
            }

            // Handle DC-related logic
            if ($request->has('dcReference') && !empty($request->input('dcReference'))) {
                $validated['dcDate'] = $request->input('dcDate') ?: now();
                $validated['status'] = 'Completed';
            }

            // Handle Remarks-related logic
            if ($request->has('remarks') && !empty($request->input('remarks'))) {
                $validated['remarksDate'] = $request->input('remarksDate') ?: now();
            }

            // Handle Quotation-related logic
            if ($request->has('quotation') && !empty($request->input('quotation'))) {
                $validated['quotationDate'] = $request->input('quotationDate') ?: now();
            }

            // Create the complaint
            $complaint = Complaint::create($validated);

            // Attach assigned workers if provided
            if ($request->has('assignedWorkers')) {
                $complaint->users()->sync($request->assignedWorkers);
            }

            // Return a successful response with the complaint data
            return response()->json($complaint->load(['admin', 'users']), 201);

        } catch (ValidationException $e) {
            // Return validation error response if validation fails
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Return a general error response for any unexpected exceptions
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    public function show($complaintId)
    {
        $complaint = Complaint::with(['admin', 'complaintAssignedUsers'])->findOrFail($complaintId);
        
        $complaint->users = collect($complaint->complaintAssignedUsers)->map(function ($assignedUser) {
            $user = User::find($assignedUser->user_id);
    
            if ($user) {
                $user->statusByUser = $assignedUser->statusByUser;
                $user->reason = $assignedUser->reason;
                $user->makeHidden(['pivot', 'remember_token']); 
            }
    
            return $user;
        });
    
        $complaint->makeHidden(['complaintAssignedUsers']);
        
        return response()->json($complaint);
    }
    
    
    
    

    public function update(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'complaintReference' => 'nullable|string|max:255',
            'complaintImage' => 'nullable|string|max:255',
            'clientName' => 'nullable|string|max:255',
            'clientPhone' => 'nullable|string|max:15',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'dueDate' => 'nullable|string',
            'createdBy' => 'nullable|exists:admin,id',
            'jcReference' => 'nullable|array',
            'jcImage' => 'nullable|string|max:255',
            'photos' => 'nullable|array',
            'priority' => 'nullable|in:Low,Medium,High',
            'remarks' => 'nullable|string',
            'status' => 'nullable|in:Pending,In Progress,Resolved,Closed',
            'poNumber' => 'nullable|string|max:255',
            'poDate' => 'nullable|string',
            'visitDates' => 'nullable|array',
            'jcDate' => 'nullable|string',
            'dcReference' => 'nullable|array',
            'dcDate' => 'nullable|string',
            'quotation' => 'nullable|string',
            'quotationDate' => 'nullable|string',
            'remarksDate' => 'nullable|string',

        ]);

        // Automatically set poDate if poNumber is provided
        if ($request->has('poNumber') && !empty($request->input('poNumber'))) {
            if (empty($complaint->poDate) && !$request->has('poDate')) {
                $validated['poDate'] = now();
            }
        }
        if ($request->has('poDate')) {
            $validated['poDate'] = $request->input('poDate');
            $validated['isPoDateEdited'] = true;
        }


        // Automatically set jcDate if jcReference is provided
        if ($request->has('jcReference') && !empty($request->input('jcReference'))) {
            if (empty($complaint->jcDate) && !$request->has('jcDate')) {
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
            if (empty($complaint->dcDate) && !$request->has('dcDate')) {
                $validated['dcDate'] = now();
                $validated['status'] = 'Completed';
            }
        }
        if ($request->has('dcDate')) {
            $validated['dcDate'] = $request->input('dcDate');
            $validated['status'] = 'Completed';
            $validated['isDcDateEdited'] = true;
        }
        // Automatically set remarksDate if remarks is provided
        if ($request->has('remarks')&& !empty($request->input('remarks'))) {
            if (empty($complaint->remarksDate) && !$request->has('remarksDate')) {
                $validated['remarksDate'] = now();
            }
        }
        if ($request->has('remarksDate')) {
            $validated['remarksDate'] = $request->input('remarksDate');
            $validated['isRemarksDateEdited'] = true;
        }
        // Automatically set quotationDate if quotation is provided
        if ($request->has('quotation')&& !empty($request->input('quotation'))) {
            if (empty($complaint->quotationDate) && !$request->has('quotationDate')) {
                $validated['quotationDate'] = now();
            }
        }
        if ($request->has('quotationDate')) {
            $validated['quotationDate'] = $request->input('quotationDate');
            $validated['isDueDateEdited'] = true;
        }
        // Automatically set dueDate if dueDate is provided

        if ($request->has('dueDate')) {
            $validated['dueDate'] = $request->input('dueDate');
            $validated['isDueDateEdited'] = true;
        }

        $validated = array_filter($validated, function ($value) {
            return !is_null($value) && $value !== '';
        });

        $complaint->update($validated);

        if ($request->has('assignedWorkers')) {
            $complaint->users()->sync($request->assignedWorkers);
        }

        return response()->json($complaint->load(['admin', 'users']));
    }


    public function destroy($id)
    {
        $complaint = Complaint::findOrFail($id);
        $complaint->delete();
        return response()->json(['message' => 'Complaint deleted successfully.']);
    }

    /*public function assignToHead(Request $request, $complaintId)
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
    }*/

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
            'Complain' => $complaint->load('users', 'admin'),
        ]);
    }

}
