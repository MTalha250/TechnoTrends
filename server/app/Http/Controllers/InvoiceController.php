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
            'invoiceReference' => 'required|string|max:255',
            'invoiceImage' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'paymentTerms' => 'required|in:Cash,Credit',
            'creditDays' => 'nullable|string|max:255',
            'dueDate' => 'nullable|date',
            'linkedProject' => 'required|exists:projects,id',
            'status' => 'required|in:Paid,Unpaid,In Progress,Overdue,Cancelled',
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
