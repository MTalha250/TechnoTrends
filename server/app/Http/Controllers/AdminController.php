<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function index()
    {
        $admins = Admin::all();
        return response()->json($admins);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:admin,email',
            'password' => 'required|string|min:6',
            'phone' => 'required|string|max:15',
            'status' => 'required|string|max:50',
        ]);

        $admin = Admin::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'status' => $request->status,
        ]);

        return response()->json($admin, 201);
    }

    public function show($id)
    {
        $admin = Admin::findOrFail($id);
        return response()->json($admin);
    }

    public function update(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:admin,email,' . $admin->id,
            'password' => 'sometimes|string|min:6',
            'phone' => 'sometimes|string|max:15',
            'status' => 'sometimes|string|max:50',
        ]);

        $admin->update([
            'name' => $request->name ?? $admin->name,
            'email' => $request->email ?? $admin->email,
            'password' => $request->password ? Hash::make($request->password) : $admin->password,
            'phone' => $request->phone ?? $admin->phone,
            'status' => $request->status ?? $admin->status,
        ]);

        return response()->json($admin);
    }

    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);
        $admin->delete();

        return response()->json(['message' => 'Admin deleted successfully.']);
    }
    public function getAdminByToken(Request $request)
    {
        $admin = $request->user();
        return response()->json($admin);
    }

}
