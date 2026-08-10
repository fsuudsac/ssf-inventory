<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $ret = [
            'success' => false,
            'message' => 'Unrecognized username or password. <b>Forgot your password?</b>',
        ];

        $credentialsEmail = [
            'email' => $request->email,
            'password' => $request->password
        ];

        $APP_NAME = str_replace(' ', '_', env('APP_NAME'));

        if (Auth::attempt($credentialsEmail)) {
            $user = Auth::user();

            if ($user->status == "Active") {
                $ret = [
                    'success' => true,
                    'message' => 'Login successfully.',
                    'data' => $this->login_data($user),
                    'token' => $user->createToken(date('Y') . '-' . $APP_NAME)->accessToken
                ];
            } else {
                $ret = [
                    'success' => false,
                    'message' => 'Your account is deactivated. Please contact the administrator.',
                ];
            }
        } else {
            $credentialsUsername = [
                'username' => $request->email,
                'password' => $request->password
            ];

            if (Auth::attempt($credentialsUsername)) {
                $user = Auth::user();

                if ($user->status == "Active") {
                    $ret = [
                        'success' => true,
                        'message' => 'Login successfully.',
                        'data' => $this->login_data($user),
                        'token' => $user->createToken(date('Y') . '-' . $APP_NAME)->accessToken
                    ];
                } else {
                    $ret = [
                        'success' => false,
                        'message' => 'Your account is deactivated. Please contact the administrator.',
                    ];
                }
            }
        }

        return response()->json($ret, 200);
    }

    public function login_data($user)
    {
        $dataUser = User::with(["attachments" => function ($q) {
            $q->where('file_description', 'Profile Picture');
            $q->orderBy('id', 'desc');
        }])->find($user->id);

        $dataProfile = Profile::firstWhere('user_id', $user->id);

        $profile_id = "";
        $firstname = "";
        $lastname = "";
        $profile_picture = "";

        if ($dataUser) {
            if ($dataUser->attachments) {
                $profile_picture = $dataUser->attachments->first()->file_path ?? null;
            }
        }

        $user['profile_picture'] = $profile_picture;

        if ($dataProfile) {
            $profile_id = $dataProfile->id;
            $firstname = $dataProfile->firstname;
            $lastname = $dataProfile->lastname;
        }

        $user['profile_id'] = $profile_id;
        $user['firstname'] = $firstname;
        $user['lastname'] = $lastname;

        return $user;
    }

    public function check_auth_status()
    {
        return response()->json([
            'success' => true,
            'message' => 'Authenticated.',
        ], 200);
    }
}
