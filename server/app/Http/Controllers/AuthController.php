<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Head;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Login user and generate token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,head,user', 
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }
    
        $role = $request->role;
        $email = $request->email;
        $password = $request->password;
    
        if ($role == 'admin') {
            $user = Admin::with(['complaints', 'projects'])->where('email', $email)->first();
        } elseif ($role == 'head') {
            $user = Head::with(['complaints', 'projects'])->where('email', $email)->first();
        } elseif ($role == 'user') {
            $user = User::with(['complaints', 'projects'])->where('email', $email)->first();
        } else {
            return response()->json(['error' => 'Invalid role'], 400);
        }
    
        if (!$user) {
            return response()->json(['error' => 'Invalid email or role'], 404);
        }
    
        if (!Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Invalid password'], 401);
        }
    
        $token = $user->createToken('YourAppName')->plainTextToken;
    
        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }
    
    public function user(Request $request)
    {
        $user = $request->user();
    
        Log::info('Fetching user details', [
            'user_id' => $user->id,
            'role' => get_class($user),
        ]);
    
        if ($user instanceof \App\Models\Admin) {
            $user->load(['complaints', 'projects']);
            Log::info('Admin data loaded', ['user_id' => $user->id]);
        } elseif ($user instanceof \App\Models\Head) {
            $user->load(['complaints', 'projects']);
            Log::info('Head data loaded', ['user_id' => $user->id]);
        } elseif ($user instanceof \App\Models\User) {
            $user->load(['complaints', 'projects']);
            Log::info('User data loaded', ['user_id' => $user->id]);
        } else {
            Log::warning('Unknown user type encountered', ['user_id' => $user->id]);
        }
    
        Log::info('User details response prepared', [
            'user_id' => $user->id,
            'complaints_count' => $user->complaints->count() ?? 0,
            'projects_count' => $user->projects->count() ?? 0,
        ]);
    
        return response()->json($user);
    }
    
    
}
