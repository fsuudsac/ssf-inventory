<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $ret = [
            'success' => false,
            'message' => 'Unrecognized username or password. <b>Forgot your password?</b>',
        ];

        $studentAllowedURL = explode(",", env("APP_ALLOWED_DOMAINS_STUDENT"));
        $host = $request->getHttpHost();

        $credentialsEmail = [
            'email' => $request->email,
            'password' => $request->password
        ];

        if (auth()->attempt($credentialsEmail)) {
            $user = auth()->user();
            $login_data = $this->login_data($request, $user);

            if (in_array($user->user_role_id, [6, 7])) {
                if (!empty(env("APP_ALLOWED_DOMAINS_STUDENT")) && in_array($host, $studentAllowedURL)) {
                    $ret = [
                        'success' => $login_data["success"],
                        'message' => $login_data["message"],
                        'data' => $login_data["data"],
                        'token' => $login_data["token"],
                    ];
                } else {
                    $ret = [
                        'success' => false,
                        'message' => 'Unrecognized username or password. <b>Forgot your password?</b>',
                    ];
                }
            } else {
                $ret = [
                    'success' => $login_data["success"],
                    'message' => $login_data["message"],
                    'data' => $login_data["data"],
                    'token' => $login_data["token"],
                ];
            }
        } else {
            $credentialsUsername = [
                'username' => $request->email,
                'password' => $request->password
            ];

            if (auth()->attempt($credentialsUsername)) {
                $user = auth()->user();
                $login_data = $this->login_data($request, $user);

                if (in_array($user->user_role_id, [6, 7])) {
                    if (!empty(env("APP_ALLOWED_DOMAINS_STUDENT")) && in_array($host, $studentAllowedURL)) {
                        $ret = [
                            'success' => $login_data["success"],
                            'message' => $login_data["message"],
                            'data' => $login_data["data"],
                            'token' => $login_data["token"],
                        ];
                    } else {
                        $ret = [
                            'success' => false,
                            'message' => 'Unrecognized username or password. <b>Forgot your password?</b>',
                        ];
                    }
                } else {
                    $ret = [
                        'success' => $login_data["success"],
                        'message' => $login_data["message"],
                        'data' => $login_data["data"],
                        'token' => $login_data["token"],
                    ];
                }
            } else {
                $ret = [
                    'success' => false,
                    'message' => 'Unrecognized username or password. <b>Forgot your password?</b>',
                ];
            }
        }

        $ret['host'] = $host;

        return response()->json($ret, 200);
    }

    public function login_data($request, $user)
    {
        $success = false;
        $message = "";
        $token = null;

        $dataProfile = \App\Models\Profile::with(["attachments" => function ($q) {
            return $q->orderBy("id", "desc");
        }])->firstWhere("user_id", $user->id);
        $dataUserRole = \App\Models\UserRole::find($user->user_role_id);

        $profile_id = "";
        $firstname = "";
        $lastname = "";
        $profile_picture = "";

        if ($dataProfile) {
            $profile_id = $dataProfile->id ?? null;
            $firstname = $dataProfile->firstname ?? null;
            $lastname = $dataProfile->lastname ?? null;

            if ($dataProfile->attachments) {
                $profile_picture = $dataProfile->attachments->first()->file_path ?? null;
            }
        }

        $user['profile_id'] = $profile_id;
        $user['firstname'] = $firstname;
        $user['lastname'] = $lastname;
        $user['profile_picture'] = $profile_picture;

        $role = "";
        $role_type = "";

        if ($dataUserRole) {
            $role = $dataUserRole->role;
            $role_type = $dataUserRole->type;
        }

        $user['role'] = $role;
        $user['role_type'] = $role_type;

        if ($user->status == 'Active') {
            if ($request->from) {
                if (in_array($user->user_role_id, [1, 2])) {
                    if ($request->from == 'faculty_monitoring_attendance_checker') {
                        $success = true;
                        $token = $user->createToken(date('Y') . '-' . env('APP_NAME'))->accessToken;
                    } else {
                        $message = "Permission not allowed!";
                    }
                } else {
                    $success = true;
                    $token = $user->createToken(date('Y') . '-' . env('APP_NAME'))->accessToken;
                }
            } else {
                $success = true;
                $token = $user->createToken(date('Y') . '-' . env('APP_NAME'))->accessToken;
            }
        } else if ($user->status == 'Deactivated') {
            $message = "This account is deactivated!";
        } else {
            $message = "Unrecognized username or password. <b>Forgot your password?</b>";
        }

        return [
            "success" => $success,
            "message" => $message,
            "token" => $token,
            "data" => $user
        ];
    }

    public function initial_registration(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not created",
        ];

        DB::transaction(function () use ($request, &$ret) {
            $request->validate([
                'email' => [
                    'required',
                    Rule::unique('users')->ignore($request->id),
                ],
                'username' => [
                    'required',
                    Rule::unique('users')->ignore($request->id),
                ],
                'password' => 'required',
            ]);

            // Create & Update User
            $createdUser = [
                "user_role_id" => 4,
                'username' => $request->username,
                'email' => $request->email,
                "password" => Hash::make($request->password),
                // "created_by" => auth()->user()->id,
                "status" => 'Deactivated',
            ];

            $users = User::where('email', $request->email)->first();
            if ($users) {
                $updateusers = $users->fill($createdUser);
                $updateusers->save();
            } else {
                $users = \App\Models\User::create($createdUser);
            }

            $ret = [
                "success" => true,
                "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully"
            ];
        });

        return response()->json($ret);
    }


    public function register(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not created",
        ];

        DB::transaction(function () use ($request, &$ret) {
            $request->validate([
                'lastname' => [
                    'required',
                    Rule::unique('profiles')->where(function ($query) use ($request) {
                        return $query->where('firstname', $request->firstname);
                    }),
                ],
                'firstname' => 'required',
                'middlename' => 'sometimes|required',

                'birthplace' => 'required',
                'birthdate' => 'required',
                'age' => 'required',

                'contact_number' => 'required',
                'email' => 'required',

                'address_list' => 'required',

                'have_disability' => 'required',
                'have_difficulty' => 'required',

                'student_level_id' => 'required',
                'student_strand' => 'sometimes|required',
                'current_course_id' => 'sometimes|required',

                'exam_schedule_id' => 'required',
                'exam_category_id' => 'required',
                'student_status' => 'required',

                'first_course_id' => 'sometimes|required',
                'second_course_id' => 'sometimes|required',
                'third_course_id' => 'sometimes|required',

                'previous_school_name' => 'sometimes|required',
                'previous_school_year' => 'sometimes|required',
            ]);

            // Create & Update User
            $findUserId = \App\Models\User::where('email', $request->email)->first();

            if ($findUserId) {
                $dataProfile = [
                    "user_id" => $findUserId->id,
                    "school_id" => $request->school_id,

                    "firstname" => $request->firstname,
                    "middlename" => $request->middlename,
                    "lastname" => $request->lastname,
                    "name_ext" => $request->name_ext,
                    "birthdate" => $request->birthdate,
                    "age" => $request->age,
                    "birthplace" => $request->birthplace,
                    "gender" => $request->gender ?? null,

                    "religion_id" => $request->religion_id,
                    "civil_status_id" => $request->civil_status_id,
                    "nationality_id" => $request->nationality_id,
                    "blood_type" => $request->blood_type ?? null,
                    "height" => $request->height ?? null,
                    "weight" => $request->weight ?? null,
                ];

                $findProfilByUserId = \App\Models\Profile::where('user_id', $findUserId->id)->first();

                $contact_number = $request->contact_number;
                $address_list = $request->address_list;

                if ($findProfilByUserId) {

                    // Language Update and Create
                    $languages = is_array($request->language) ? $request->language : [$request->language];

                    $existingLanguages = \App\Models\ProfileLanguage::where('profile_id', $findProfilByUserId->id)->pluck('language')->toArray();

                    foreach ($existingLanguages as $current) {
                        if (!in_array($current, $languages)) {
                            // Deactive existing language if not in new languages
                            \App\Models\ProfileLanguage::where('profile_id', $$findProfilByUserId->id)
                                ->where('language', $current)
                                ->update(['status' => 0]);
                        }
                    }

                    // Add new languages
                    foreach ($languages as $language) {
                        // Check if language is not empty or null
                        if (!empty($language)) {
                            $findLanguage = \App\Models\ProfileLanguage::where('profile_id', $$findProfilByUserId->id)
                                ->where('language', $language)
                                ->first();

                            if ($findLanguage) {
                                $findLanguage->fill([
                                    "profile_id" => $profile_id,
                                    'language' => $language,
                                    'status' => 1,
                                    'updated_by' => auth()->user()->id
                                ])->save();
                            } else {
                                \App\Models\ProfileLanguage::create([
                                    "profile_id" => $profile_id,
                                    'language' => $language,
                                    'status' => 1,
                                    'created_by' => auth()->user()->id
                                ]);
                            }
                        }
                    }

                    // Contact Information Update and Create
                    if ($contact_number != "") {

                        \App\Models\ProfileContactInformation::where("profile_id", $profile_id)->update(['status' => 0]);

                        $findContactInformation = \App\Models\ProfileContactInformation::where("contact_number", $contact_number)
                            ->where("profile_id", $profile_id)
                            ->first();

                        if ($findContactInformation) {
                            $findContactInformation->fill([
                                "status" => 1,
                                "email" => $request->personal_email,
                                "updated_by" => auth()->user()->id,
                            ])->save();
                        } else {
                            \App\Models\ProfileContactInformation::create([
                                'contact_number' => $contact_number,
                                'category' => 'Student Contact Information',
                                "fullname" => $request->firstname . ' ' . (!empty($request->middlename) ? $request->middlename . ' ' : '') .
                                    $request->lastname,
                                "email" => $request->personal_email,
                                "profile_id" => $profile_id,
                                "created_by" => auth()->user()->id,
                                'status' => 1,
                            ]);
                        }
                    }

                    // Student Address Update and Create
                    if (!empty($address_list)) {
                        foreach ($address_list as $key => $value) {
                            if (!empty($value['id'])) {
                                $findStudentAddress = \App\Models\ProfileAddress::where('id', $value['id'])
                                    ->where('category', 'STUDENT ADDRESS')
                                    ->first();

                                if ($findStudentAddress) {
                                    $findStudentAddress->fill([
                                        "profile_id" => $profile_id,
                                        'category' => "STUDENT ADDRESS",
                                        'address' => $value['address'] ?? null,
                                        'city_id' => $value['municipality_id'] ?? null,
                                        'barangay_id' => $value['barangay_id'] ?? null,
                                        'is_home_address' => !empty($value['is_home_address']) && $value['is_home_address'] ? 1 : 0,
                                        'is_current_address' => !empty($value['is_current_address']) && $value['is_current_address'] ? 1 : 0,
                                        'updated_by' => auth()->user()->id
                                    ])->save();
                                }
                            } else {
                                \App\Models\ProfileAddress::create([
                                    "profile_id" => $profile_id,
                                    'category' => "STUDENT ADDRESS",
                                    'address' => $value['address'] ?? null,
                                    'city_id' => $value['municipality_id'] ?? null,
                                    'barangay_id' => $value['barangay_id'] ?? null,
                                    'is_home_address' => !empty($value['is_home_address']) && $value['is_home_address'] ? 1 : 0,
                                    'is_current_address' => !empty($value['is_current_address']) && $value['is_current_address'] ? 1 : 0,
                                    'created_by' => auth()->user()->id
                                ]);
                            }
                        }
                    }

                    // Profile Health Information
                    $findHealthInfo = \App\Models\ProfileHealthInformations::where('profile_id', $profile_id)
                        ->first();

                    if ($findHealthInfo) {
                        $findHealthInfo->fill([
                            "profile_id" => $profile_id,

                            'have_disability' => $request->have_disability ?? null,
                            'disability_type' => is_array($request->disability_type) ? implode(', ', $request->disability_type) :
                                $request->disability_type,
                            'other_disability' => $request->other_disability ?? null,

                            'have_difficulty' => $request->have_difficulty ?? null,
                            'difficulty_type' => is_array($request->difficulty_type) ? implode(', ', $request->difficulty_type) :
                                $request->difficulty_type,
                            'other_difficulty' => $request->other_difficulty ?? null,


                            'updated_by' => auth()->user()->id
                        ])->save();
                    } else {
                        \App\Models\ProfileHealthInformations::create([
                            "profile_id" => $profile_id,

                            'have_disability' => $request->have_disability ?? null,
                            'disability_type' => is_array($request->disability_type) ? implode(', ', $request->disability_type) :
                                $request->disability_type,

                            'other_disability' => $request->other_disability ?? null,

                            'have_difficulty' => $request->have_difficulty ?? null,
                            'difficulty_type' => is_array($request->difficulty_type) ? implode(', ', $request->difficulty_type) :
                                $request->difficulty_type,
                            'other_difficulty' => $request->other_difficulty ?? null,

                            'created_by' => auth()->user()->id
                        ]);
                    }

                    // Student Exam Result Update and Create
                    $findStudentExam = \App\Models\StudentExam::where("profile_id", $profile_id)
                        ->first();

                    // $examCategory = RefExamCategory::where('id', $request->exam_category_id)->first();

                    if ($findStudentExam) {

                        $findStudentExam->fill([
                            "profile_id" => $profile_id,
                            'exam_schedule_id' => $request->exam_schedule_id,
                            "exam_category_id" => $request->exam_category_id,
                            'scholarship' => is_array($request->scholarship) ? implode(' , ', $request->scholarship) : $request->scholarship,
                            "schedule_status" => $request->schedule_status,
                            "updated_by" => auth()->user()->id,
                        ])->save();
                    } else {
                        \App\Models\StudentExam::create([
                            "profile_id" => $profile_id,
                            'exam_schedule_id' => $request->exam_schedule_id,
                            "exam_category_id" => $request->exam_category_id,
                            'scholarship' => is_array($request->scholarship) ? implode(' , ', $request->scholarship) : $request->scholarship,
                            "schedule_status" => 'Applied',
                            "category" => 'Walk-In',
                            "status" => 'Active',
                            "created_by" => auth()->user()->id,
                        ]);
                    }

                    // Academic Profile Update & Create
                    $findStudentAcademic = \App\Models\StudentAcademic::where('profile_id', $profile_id)
                        ->where('category', 'Academic Profile')
                        ->first();

                    if ($findStudentAcademic) {
                        $findStudentAcademic->fill([
                            "profile_id" => $profile_id,
                            'student_status' => $request->student_status ?? null,
                            'student_level_id' => $request->student_level_id ?? null,
                            // 'student_strand' => $request->student_level_id == 4 ? $request->student_strand : null,
                            'student_strand' => $request->student_strand,
                            'current_course_id' => $request->current_course_id,

                            // Top three courses
                            'first_course_id' => $request->first_course_id,
                            'second_course_id' => $request->second_course_id,
                            'third_course_id' => $request->third_course_id ?? null,

                            // Transferee
                            'previous_school_name' => $request->student_status == "Transferee" ? $request->previous_school_name : null,
                            'previous_school_year' => $request->student_status == "Transferee" ? $request->previous_school_year : null,
                            'applied_to_fsuu' => $request->student_status == "Transferee" ? $request->applied_to_fsuu : null,
                            'year_applied' => $request->student_status == "Transferee" && $request->applied_to_fsuu == "No" ? null :
                                $request->year_applied,
                            'accepted_to_fsuu' => $request->student_status == "Transferee" ? $request->accepted_to_fsuu : null,
                            'year_accepted' => $request->student_status == "Transferee" && $request->accepted_to_fsuu == "No" ? null :
                                $request->year_accepted,
                            'attended_to_fsuu' => $request->student_status == "Transferee" ? $request->attended_to_fsuu : null,
                            'year_attended' => $request->student_status == "Transferee" && $request->attended_to_fsuu == "No" ? null :
                                $request->year_attended,

                            // Pursuing a Second Degree
                            'intend_to_pursue' => $request->student_status == "Pursuing a Second Degree" ? $request->intend_to_pursue : null,
                            'working_student' => $request->student_status == "Pursuing a Second Degree" ? $request->working_student : null,
                            'employer_name' => $request->student_status == "Pursuing a Second Degree" ? $request->employer_name : null,
                            'employer_address' => $request->student_status == "Pursuing a Second Degree" ? $request->employer_address : null,

                            'updated_by' => auth()->user()->id
                        ])->save();
                    } else {
                        \App\Models\StudentAcademic::create([
                            "profile_id" => $profile_id,
                            'category' => 'Academic Profile',
                            'student_status' => $request->student_status ?? null,
                            'student_level_id' => $request->student_level_id ?? null,
                            'student_strand' => $request->student_strand ?? null,
                            'current_course_id' => $request->current_course_id ?? null,

                            // Top three courses
                            'first_course_id' => $request->first_course_id ?? null,
                            'second_course_id' => $request->second_course_id ?? null,
                            'third_course_id' => $request->third_course_id ?? null,

                            // Transferee
                            'previous_school_name' => $request->previous_school_name ?? null,
                            'previous_school_year' => $request->previous_school_year ?? null,
                            'applied_to_fsuu' => $request->applied_to_fsuu ?? null,
                            'year_applied' => $request->year_applied ?? null,
                            'accepted_to_fsuu' => $request->accepted_to_fsuu ?? null,
                            'year_accepted' => $request->year_accepted ?? null,
                            'attended_to_fsuu' => $request->attended_to_fsuu ?? null,
                            'year_attended' => $request->year_attended ?? null,

                            // Pursuing a Second Degree
                            'intend_to_pursue' => $request->intend_to_pursue ?? null,
                            'working_student' => $request->working_student ?? null,
                            'employer_name' => $request->employer_name ?? null,
                            'employer_address' => $request->employer_address ?? null,

                            'created_by' => auth()->user()->id
                        ]);
                    }

                    $this->user_persmissions($findUserId->id, $request->user_role_id);
                }

                $from_name = \App\Models\Profile::where('user_id', auth()->user()->id)->latest()->first();

                // Email ACCOUNT REGISTRATION
                $this->send_email([
                    'title' => "ACCOUNT REGISTRATION",
                    'to_name' => $request->firstname . " " . $request->lastname,
                    'account' => $request->username,
                    'password' => $request->password,
                    'exam_schedule ' => $request->exam_schedule_id,
                    'position' => "FSUU GUIDANCE",
                    'to_email' => $request->personal_email,
                    'sender_name' => auth()->user()->firstname . " " . auth()->user()->lastname,
                    "system_id" => 3,
                ]);

                $this->send_notification([
                    "title" => "New Student Application",
                    "description" => "Your application was approved",
                    "link" => "",
                    "link_origin" => $request->link_origin,
                    "userIds" => [$findUserId->id],
                    "system_id" => 3,
                ]);

                $ret = [
                    "success" => true,
                    "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully"
                ];
            }

            $ret = [
                "success" => true,
                "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully"
            ];
        });

        return response()->json($ret);
    }

    public function check_auth_status()
    {
        $ret = [
            "success" => false,
            "message" => "Authentication status ok",
        ];


        return response()->json($ret, 200);
    }
}