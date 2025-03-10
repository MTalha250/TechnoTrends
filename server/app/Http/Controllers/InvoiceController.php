<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Exception;
class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with('project')->get();
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'invoiceReference' => 'nullable|string|max:255',
                'invoiceImage' => 'nullable|string|max:255',
                'amount' => 'nullable|numeric',
                'paymentTerms' => 'nullable|in:Cash,Credit',
                'creditDays' => 'nullable|string|max:255',
                'dueDate' => 'nullable|date',
                'linkedProject' => 'nullable|exists:projects,id',
                'status' => 'nullable|in:Paid,Unpaid,In Progress,Overdue,Cancelled',
                'clientName' => 'nullable|string|max:255',
                'poNumber' => 'nullable|string|max:255',
                'poDate' => 'nullable|string',
                'jcReference' => 'nullable|string|max:255',
                'jcDate' => 'nullable|string',
                'dcReference' => 'nullable|string|max:255',
                'dcDate' => 'nullable|string',
                'invoiceDate' => 'nullable|string',
            ]);
    
            // Automatically set poDate, jcDate, and dcDate if applicable
            if ($request->has('poNumber')) {
                $validated['poDate'] = $request->input('poDate') ?: now();  // Set to current date if no poDate provided
            }
    
            if ($request->has('jcReference')) {
                $validated['jcDate'] = $request->input('jcDate') ?: now();  // Set to current date if no jcDate provided
            }
    
            if ($request->has('dcReference')) {
                $validated['dcDate'] = $request->input('dcDate') ?: now();  // Set to current date if no dcDate provided
            }
    
            // Create the invoice
            $invoice = Invoice::create($validated);
    
            // Load the related project data
            $invoice->load('project');
    
            // Return success response
            return response()->json($invoice, 201);
    
        } catch (ValidationException $e) {
            // Return validation errors as JSON
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->errors()
            ], 422);
        
        } catch (ModelNotFoundException $e) {
            // Handle case where the linked project doesn't exist
            return response()->json([
                'error' => 'Linked project not found',
                'message' => 'The specified linked project does not exist.'
            ], 404);
    
        } catch (Exception $e) {
            // Handle any other general errors
            return response()->json([
                'error' => 'Something went wrong',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function show($id)
    {
        $invoice = Invoice::with('project')->findOrFail($id);
        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'invoiceReference' => 'string|max:255',
            'invoiceImage' => 'string|max:255',
            'amount' => 'numeric',
            'paymentTerms' => 'in:Cash,Credit',
            'creditDays' => 'nullable|string|max:255',
            'dueDate' => 'nullable|date',
            'linkedProject' => 'exists:projects,id',
            'status' => 'in:Paid,Unpaid,In Progress,Overdue,Cancelled',
            'clientName' => 'nullable|string|max:255',
            'poNumber' => 'nullable|string|max:255',
            'poDate' => 'nullable|string',
            'jcReference' => 'nullable|string|max:255',
            'jcDate' => 'nullable|string',
            'dcReference' => 'nullable|string|max:255',
            'dcDate' => 'nullable|string',
            'invoiceDate' => 'nullable|string',
        ]);
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

        $invoice->update($validated);
        return response()->json($invoice->load('project'));
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully.']);
    }
}
