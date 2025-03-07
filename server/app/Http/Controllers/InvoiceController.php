<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with('project')->get();
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoiceReference' => 'required|string|max:255', // required
            'invoiceImage' => 'required|string|max:255', // required
            'amount' => 'required|numeric', // required
            'paymentTerms' => 'required|in:Cash,Credit', // required
            'creditDays' => 'nullable|string|max:255', // nullable
            'dueDate' => 'nullable|date', // required
            'linkedProject' => 'required|exists:projects,id', // required
            'status' => 'required|in:Paid,Unpaid,In Progress,Overdue,Cancelled', // required
            'clientName' => 'nullable|string|max:255', // nullable
            'poNumber' => 'nullable|string|max:255', // nullable
            'poDate' => 'nullable|string', // nullable
            'jcReference' => 'nullable|string|max:255', // nullable
            'jcDate' => 'nullable|string', // nullable
            'dcReference' => 'nullable|string|max:255', // nullable
            'dcDate' => 'nullable|string', // nullable
            'invoiceDate' => 'nullable|string', // nullable

        ]);

        $invoice = Invoice::create($validated);
        return response()->json($invoice->load('project'), 201);
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
