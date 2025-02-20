<?php

namespace App\Http\Controllers;

use App\Imports\FacultyImport;
use App\Imports\StudentSubjectImport;
use App\Models\Profile;
use App\Models\ProfileDepartment;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $fullname = $this->fullname;
        $username = "(SELECT username FROM users WHERE users.id = profiles.user_id)";
        $school_id = "REPLACE(school_id, '-', '')";
        $created_at_formatted = "DATE_FORMAT(profiles.created_at, '%m-%d-%Y')";
        $user_role = "(SELECT (SELECT role FROM user_roles WHERE user_roles.id = users.user_role_id) FROM users WHERE users.id = profiles.user_id)";
        $user_type = "(SELECT (SELECT type FROM user_roles WHERE user_roles.id = users.user_role_id) FROM users WHERE users.id = profiles.user_id)";
        $departments = "(SELECT GROUP_CONCAT(ref_departments.department_name SEPARATOR ', ')
            FROM profile_departments
            JOIN ref_departments ON profile_departments.department_id = ref_departments.id
            WHERE profile_departments.profile_id = profiles.id
            AND profile_departments.status = 1)";

        $data = Profile::select([
            "*",
            DB::raw("$fullname fullname"),
            DB::raw("$username username"),
            DB::raw("$school_id school_id"),
            DB::raw("$user_role user_role"),
            DB::raw("$user_type user_type"),
            DB::raw("$created_at_formatted created_at_formatted"),
            DB::raw("$departments departments"),
        ])
            ->withCount([
                'faculty_loads as faculty_loads_subject' => function ($query) use ($request) {
                    if ($request->from == 'grade_file_status') {
                        $query->whereHas(
                            'grade_files',
                            function ($query) use ($request) {
                                if ($request->grade_file_status == 'Approved') {
                                    $query->whereIn('status', ['Approved', 'Uploaded']);
                                } else if ($request->grade_file_status == 'Approval') {
                                    $query->where('status', 'Uploaded');
                                }
                            }
                        );

                        $query->orWhereDoesntHave('grade_files');
                    } else if ($request->from == 'grade_file_report') {
                        if ($request->grade_file_report_status == 'All') {
                            $query->whereHas(
                                'grade_files',
                                function ($query) {
                                    $query->whereIn('status', ['Uploaded', 'Approved']);
                                }
                            );
                            $query->orWhereDoesntHave('grade_files');
                        } else if ($request->grade_file_report_status == 'NoUpload') {
                            $query->doesntHave('grade_files');
                        } else if ($request->grade_file_report_status == 'Uploaded') {
                            $query->whereHas(
                                'grade_files',
                                function ($query) {
                                    $query->where('status', 'Uploaded');
                                }
                            );
                        } else if ($request->grade_file_report_status == 'Approved') {
                            $query->whereHas(
                                'grade_files',
                                function ($query) {
                                    $query->where('status', 'Approved');
                                }
                            );
                        }
                    }
                },
                'faculty_loads as grade_file_approved' => function ($query) use ($request) {
                    $query->whereHas(
                        'grade_files',
                        function ($query) use ($request) {
                            if ($request->from == 'grade_file_report') {
                                if ($request->grade_file_report_status != 'All') {
                                    $query->where('status', 'Approved');
                                } else {
                                    $query->where('status', 'Approved');
                                }
                            } else {
                                $query->where('status', 'Approved');
                            }
                        }
                    );
                },
                'faculty_loads as grade_file_approval' => function ($query) use ($request) {
                    $query->whereHas(
                        'grade_files',
                        function ($query) use ($request) {
                            if ($request->from == 'grade_file_report') {
                                if ($request->grade_file_report_status != 'All') {
                                    $query->where('status', 'Uploaded');
                                } else {
                                    $query->where('status', 'Uploaded');
                                }
                            } else {
                                $query->where('status', 'Uploaded');
                            }
                        }
                    );
                },
                'faculty_loads as grade_file_no_upload' => function ($query) {
                    $query->doesntHave('grade_files');
                },
            ]);

        $data->where(function ($query) use ($request, $fullname, $username, $school_id, $created_at_formatted) {
            if ($request->search) {
                $query->orWhere(DB::raw("$fullname"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$username"), 'LIKE', "%$request->search%");
                $query->orWhere("primary_email", 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$school_id"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$created_at_formatted"), 'LIKE', "%$request->search%");
            }
        });

        if ($request->status == "Archived") {
            $data->onlyTrashed();
        }

        $data->whereHas('user', function ($query) use ($request) {
            if ($request->roles) {
                $roles = explode(",", $request->roles);
                $query->whereIn('user_role_id', $roles);
            }
        });

        $find_profile_by_user_id = $this->find_profile_by_user_id(auth()->user()->id);

        if ($request->from) {
            if ($request->from == '/employees/archived') {
                $data->onlyTrashed();
            } else if ($request->from == '/employees/full-time') {
                $data->employmentTypeFullTime();
            } else if ($request->from == '/employees/part-time') {
                $data->employmentTypePartTime();
            } else if ($request->from == '/students') {
                $data->whereHas('user', function ($query) {
                    $query->whereIn('user_role_id', [6, 7]);
                });
                if ($request->status == 'Archived') {
                    $data->onlyTrashed();
                }
            } else if ($request->from == '/faculty') {
                $data->whereIn('employment_type', ['Full-Time', 'Part-Time']);

                if ($request->isTrash) {
                    $data->onlyTrashed();
                } else {
                    $data->whereNull("deactivated_at");
                }
            } else if (in_array($request->from, ['grade_file', 'grade_file_status', 'grade_file_report'])) {
                if (in_array(auth()->user()->user_role_id, [3, 4])) {
                    if ($find_profile_by_user_id) {
                        $departments = $find_profile_by_user_id->profile_departments->filter(function ($value) {
                            return $value->status == 1;
                        });

                        if ($departments->count() > 0) {
                            $departmentArray = $departments->map(function ($value) {
                                return $value->department_id;
                            })->toArray();

                            $data->whereHas("profile_departments", function ($query) use ($departmentArray) {
                                $query->whereIn("department_id", $departmentArray);
                            });
                        }
                    }
                } else if (in_array(auth()->user()->user_role_id, [5])) {
                    $data->whereHas('faculty_loads', function ($query) use ($request) {
                        if ($request->school_year_id) {
                            $query->where('school_year_id', $request->school_year_id);
                        }

                        if ($request->semester_id) {
                            $query->where('semester_id', $request->semester_id);
                        }
                    });

                    $data->where('user_id', auth()->user()->id);
                }

                if ($request->profile_ids) {
                    $data->whereIn('id', explode(",", $request->profile_ids));
                }

                $data->whereHas('faculty_loads', function ($query) use ($request) {
                    if ($request->from == 'grade_file_status') {
                        if ($request->grade_file_status) {
                            if ($request->grade_file_status == 'Approved') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Approved');
                                });
                            } else if ($request->grade_file_status == 'Approval') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', '!=', 'Approved');
                                });
                            }
                        }

                        if ($request->grade_file_type) {
                            $query->whereHas('grade_files', function ($query) use ($request) {
                                $query->where('type', $request->grade_file_type);
                            });
                        }
                    } else if ($request->from == 'grade_file_report') {
                        if ($request->grade_file_report_status && $request->grade_file_report_status != 'All') {
                            if ($request->grade_file_report_status == 'NoUpload') {
                                $query->doesntHave('grade_files');
                            } else if ($request->grade_file_report_status == 'Uploaded') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Uploaded');
                                });
                            } else if ($request->grade_file_report_status == 'Approved') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Approved');
                                });
                            }
                        }
                    }

                    if ($request->school_year_id) {
                        $query->where('school_year_id', $request->school_year_id);
                    }

                    if ($request->semester_id) {
                        $query->where('semester_id', $request->semester_id);
                    }

                    if ($request->department_id) {
                        $query->where('department_id', $request->department_id);
                    }
                });
            } else if ($request->from == 'FacultyMonitoringAttendance') {
                $data->whereHas('faculty_loads', function ($query) {
                    $query->whereHas('faculty_load_schedules', function ($query) {
                        $query->whereDoesntHave("faculty_load_monitorings", function ($query) {
                            $query->whereDate("created_at", "=", date('Y-m-d'));
                        });

                        $query->where(DB::raw("( SELECT
                                                    IF (
                                                        `name` = 'Monday',
                                                        'Mon',
                                                    IF
                                                        (
                                                            `name` = 'Tuesday',
                                                            'Tue',
                                                        IF
                                                            (
                                                                `name` = 'Wednesday',
                                                                'Wed',
                                                            IF
                                                                (
                                                                    `name` = 'Thursday',
                                                                    'Thu',
                                                                IF
                                                                    ( `name` = 'Friday', 'Fri', IF ( `name` = 'Saturday', 'Sat', IF ( `name` = 'Sunday', 'Sun', '' ) ) )
                                                                )
                                                            )
                                                        ))
                                                FROM
                                                    ref_day_schedules
                                                WHERE
                                                    ref_day_schedules.id = day_schedule_id
                                                    ) = DATE_FORMAT(
                                                NOW(), '%a' )"), ">", 0);
                    });
                });
            }
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order)  ? $request->sort_order : 'desc');
            }
        } else {
            $data->orderBy('id', 'desc');
        }

        if ($request->page_size) {
            $data = $data->limit($request->page_size)
                ->paginate($request->page_size, ['*'], 'page', $request->page)
                ->toArray();
        } else {
            $data = $data->get();
        }

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not saved.",
        ];

        $request->validate([
            'username' => [
                'required',
                Rule::unique('users')->ignore($request->id),
                function ($attribute, $value, $fail) use ($request) {
                    $existingUser = User::where('email', $value)->first();
                    if ($existingUser && $existingUser->id != $request->id) {
                        $fail('The email has already been taken');
                    }
                },
            ],
            'email' => [
                'required',
                Rule::unique('users')->ignore($request->id),
                function ($attribute, $value, $fail) use ($request) {
                    $existingUser = User::where('username', $value)->first();
                    if ($existingUser && $existingUser->id != $request->id) {
                        $fail('The email has already been taken');
                    }
                },
            ],
        ]);

        $usersInfo = [
            "user_role_id"  => $request->user_role_id,
            "username"      => $request->username,
            "email"         => $request->email,
            "created_by"    => auth()->user()->id,
            "status"        => "Active",
        ];

        $createUser = User::create($usersInfo);

        if ($createUser) {
            $dataProfile = [
                "user_id" => $createUser->id,
                "firstname" => $request->firstname,
                "middlename" => $request->middlename,
                "lastname" => $request->lastname,
                "name_ext" => $request->name_ext,
                "birthplace" => $request->birthplace,
                "birthdate" => new DateTime($request->birthdate),
                "gender" => $request->gender,
                "height" => $request->height,
                "weight" => $request->weight,
                "blood_type" => $request->blood_type,
                "nationality_id" => $request->nationality_id,
                "civil_status_id" => $request->civil_status_id,
                "employment_type" => $request->employment_type,
            ];


            $findProfilByUserId = \App\Models\Profile::where('user_id', $createUser->id)->first();


            $profile_id = "";

            if ($findProfilByUserId) {
                $profile_id = $findProfilByUserId->id;
                $dataProfile["updated_by"] = auth()->user()->id;

                $findProfilByUserIdUpdate = $findProfilByUserId->fill($dataProfile);
                $findProfilByUserIdUpdate->save();

                if ($request->hasFile('profile_picture')) {
                    $this->create_attachment($findProfilByUserId, $request->file('profile_picture'), [
                        "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                        "file_description" => "Profile",
                    ]);
                }
            } else {
                $dataProfile["created_by"] = auth()->user()->id;
                $createProfile = \App\Models\Profile::create($dataProfile);

                if ($createProfile) {
                    $profile_id = $createProfile->id;

                    if ($request->hasFile('profile_picture')) {
                        $this->create_attachment($createProfile, $request->file('profile_picture'), [
                            "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                            "file_description" => "Profile Picture",
                        ]);
                    }
                }
            }

            if ($profile_id) {
                // Language Update & Create
                if (!empty($language_ids)) {
                    foreach (json_decode($language_ids) as $id) {
                        $findProfileLanguage = \App\Models\ProfileLanguage::where('language_id', $id)
                            ->where('profile_id', $profile_id)
                            ->first();

                        if ($findProfileLanguage) {
                            $findProfileLanguage->fill([
                                "profile_id" => $profile_id,
                                'language_id' => $id,
                                "updated_by" => auth()->user()->id,
                            ])->save();
                        } else {
                            \App\Models\ProfileLanguage::create([
                                "profile_id" => $profile_id,
                                'language_id' => $id,
                                "created_by" => auth()->user()->id,
                            ]);
                        }
                    }
                }
            }

            $ret = [
                "success" => true,
                "message" => "Data saved successfully",
                "profile_id" => $profile_id
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = Profile::with([
            'user',
            'profile_departments',
            'profile_addresses',
            'profile_contact_informations',
            'profile_spouses.profile_childrens',
            'profile_school_attendeds',
            'profile_others',
            'profile_beneficiaries',
            'profile_parent_informations',
            'profile_work_experiences',
            'profile_training_certificates',
            'profile_languages',
            'attachments',
            'student_academics' => function ($query) {
                $query->with(['student_exams' => function ($query) {
                    $query->with(['student_exam_results']);
                }]);
            }
        ])
            ->find($id);

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
            "request" => $request->all(),
        ];

        return response()->json($ret, 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function destroy(Profile $profile)
    {
        //
    }

    public function profile_update(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
            "request" => $request->all(),
        ];

        $data = $request->validate([
            'firstname' => 'required',
            'lastname' => 'required',
            'middlename' => 'required',
            'name_ext' => 'required',
            'birthdate' => 'required',
            'birthplace' => 'required',
            'blood_type' => '',
            'employment_type' => 'required',
            'gender' => '',
            'height' => '',
            'nationality_id' => '',
            'religion_id' => '',
            'weight' => '',
        ]);

        $findProfile = Profile::find($request->id);

        if ($findProfile) {
            $findProfile->fill($data);
            if ($findProfile->save()) {
                \App\Models\ProfileLanguage::where('profile_id', $request->id)->delete();

                $language_ids = json_decode($request->language_ids);

                foreach ($language_ids as $key => $value) {
                    $findProfileLanguage = \App\Models\ProfileLanguage::where('language_id', $value)
                        ->where('profile_id', $request->id)
                        ->first();

                    if (!$findProfileLanguage) {
                        \App\Models\ProfileLanguage::create([
                            "profile_id" => $request->id,
                            'language_id' => $value,
                            "created_by" => auth()->user()->id,
                        ]);
                    } else {
                        $findProfileLanguage->fill([
                            "delete_at" => null,
                        ])->save();
                    }
                }

                $ret = [
                    "success" => true,
                    "message" => "Data updated successfully",
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function create_profile(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not created",
        ];

        $request->validate([
            'username' => [
                'required',
                Rule::unique('users')->ignore($request->id),
                function ($attribute, $value, $fail) use ($request) {
                    $existingUser = User::where('email', $value)->first();
                    if ($existingUser && $existingUser->id != $request->id) {
                        $fail('The email has already been taken');
                    }
                },
            ],
            'email' => [
                'required',
                Rule::unique('users')->ignore($request->id),
                function ($attribute, $value, $fail) use ($request) {
                    $existingUser = User::where('username', $value)->first();
                    if ($existingUser && $existingUser->id != $request->id) {
                        $fail('The email has already been taken');
                    }
                },
            ],
        ]);

        $usersInfo = [
            "user_role_id"  => $request->user_role_id,
            "username"      => $request->username,
            "email"         => $request->email,
            "password"      => Hash::make($request->password),
            "created_by"    => auth()->user()->id,
            "status"        => "Active",
        ];

        $createUser = User::create($usersInfo);

        if ($createUser) {
            $dataProfile = [
                "user_id" => $createUser->id,
                "school_id" => $request->school_id,
                "firstname" => $request->firstname,
                "middlename" => $request->middlename,
                "lastname" => $request->lastname,
                "name_ext" => $request->name_ext,
                "birthplace" => $request->birthplace,
                "birthdate" => new DateTime($request->birthdate),
                "gender" => $request->gender,
                "height" => $request->height,
                "weight" => $request->weight,
                "blood_type" => $request->blood_type,
                "nationality_id" => $request->nationality_id,
                "civil_status_id" => $request->civil_status_id,
                "employment_type" => $request->employment_type,
            ];

            $findProfilByUserId = \App\Models\Profile::where('user_id', $createUser->id)->first();

            $folder_name = "";

            if ($findProfilByUserId) {
                if (!$findProfilByUserId->school_id) {
                    $dataProfile["school_id"] = $this->generate_school_id("employee", $request->employment_type);
                }
                if ($findProfilByUserId->folder_name) {
                    $folder_name = $findProfilByUserId->folder_name;
                } else {
                    $folder_name = Str::random(10);
                    $dataProfile["folder_name"] = $folder_name;
                }
            } else {
                $dataProfile["school_id"] = $this->generate_school_id("employee", $request->employment_type);
                $folder_name = Str::random(10);
                $dataProfile["folder_name"] = $folder_name;
            }

            $profile_id = "";

            if ($findProfilByUserId) {
                $profile_id = $findProfilByUserId->id;
                $dataProfile["updated_by"] = auth()->user()->id;

                $findProfilByUserIdUpdate = $findProfilByUserId->fill($dataProfile);
                $findProfilByUserIdUpdate->save();

                if ($request->hasFile('imagefile')) {
                    $this->create_attachment($findProfilByUserId, $request->file('imagefile'), [
                        "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                        "file_description" => "Profile",
                    ]);
                }
            } else {
                $dataProfile["created_by"] = auth()->user()->id;
                $createProfile = \App\Models\Profile::create($dataProfile);

                if ($createProfile) {
                    $profile_id = $createProfile->id;

                    if ($request->hasFile('imagefile')) {

                        $this->create_attachment($createProfile, $request->file('imagefile'), [
                            "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                            "file_description" => "Profile",
                        ]);
                    }
                }
            }

            $department_id = $request->department_id;
            $language_id = $request->language_id;

            $address_list = $request->address_list;
            $contact_list = $request->contact_list;
            $spouse_list = $request->spouse_list;
            $school_attended_list = $request->school_attended_list;

            $profile_other1 = $request->profile_other1;
            $profile_other2 = $request->profile_other2;
            $profile_other3 = $request->profile_other3;
            $profile_other4 = $request->profile_other4;
            $profile_other5 = $request->profile_other5;
            $profile_other6 = $request->profile_other6;

            $emergency_contact_list = $request->emergency_contact_list;
            $benificiary_list = $request->benificiary_list;
            $parent_list = $request->parent_list;
            $work_experience_list = $request->work_experience_list;
            $training_certificate_list = $request->training_certificate_list;

            if ($profile_id != "") {

                // Department Update & Create
                if ($department_id != "") {
                    \App\Models\ProfileDepartment::where("profile_id", $profile_id)->update(['status' => 0]);

                    $findDepartment = \App\Models\ProfileDepartment::where("department_id", $department_id)
                        ->where("profile_id", $profile_id)
                        ->first();

                    if ($findDepartment) {
                        $findDepartment->fill([
                            'status' => 1,
                            "updated_by" => auth()->user()->id,
                        ])->save();
                    } else {
                        \App\Models\ProfileDepartment::create([
                            'department_id' => $department_id,
                            "profile_id" => $profile_id,
                            "created_by" => auth()->user()->id,
                            'status' => 1,
                        ]);
                    }
                }

                // Language Update & Create
                if (!empty($language_id)) {
                    foreach (json_decode($language_id) as $id) {
                        $findProfileLanguage = \App\Models\ProfileLanguage::where('language_id', $id)
                            ->where('profile_id', $profile_id)
                            ->first();

                        if ($findProfileLanguage) {
                            $findProfileLanguage->fill([
                                "profile_id" => $profile_id,
                                'language_id' => $id,
                                "updated_by" => auth()->user()->id,
                            ])->save();
                        } else {
                            \App\Models\ProfileLanguage::create([
                                "profile_id" => $profile_id,
                                'language_id' => $id,
                                "created_by" => auth()->user()->id,
                            ]);
                        }
                    }
                }

                // Address Update & Create
                if (!empty($address_list)) {
                    foreach (json_decode($address_list, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findAddress = \App\Models\ProfileAddress::find($value['id']);

                            $findAddress->fill([
                                "profile_id" => $profile_id,
                                'address' => $value['address'] ?? null,
                                'city_id' => $value['municipality_id'] ?? null,
                                'is_home_address' => !empty($value['is_home_address']) && $value['is_home_address'] ? 1 : 0,
                                'is_current_address' => !empty($value['is_current_address']) && $value['is_current_address'] ? 1 : 0,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {
                            \App\Models\ProfileAddress::create([
                                "profile_id" => $profile_id,
                                'address' => $value['address'] ?? null,
                                'city_id' => $value['municipality_id'] ?? null,
                                'is_home_address' => !empty($value['is_home_address']) && $value['is_home_address'] ? 1 : 0,
                                'is_current_address' => !empty($value['is_current_address']) && $value['is_current_address'] ? 1 : 0,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Contact Information Update & Create
                if (!empty($contact_list)) {
                    foreach (json_decode($contact_list, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findContactInformation = \App\Models\ProfileContactInformation::find($value['id']);

                            $findContactInformation->fill([
                                "profile_id" => $profile_id,
                                'contact_number' => $value['contact_number'] ?? null,
                                'fullname' => $value['fullname'] ?? null,
                                'email' => $value['email'] ?? null,
                                'category' => "CONTACT INFORMATION",
                                'updated_by' => auth()->user()->id,
                            ])->save();
                        } else {
                            \App\Models\ProfileContactInformation::create([
                                "profile_id" => $profile_id,
                                'contact_number' => $value['contact_number'] ?? null,
                                'fullname' => $value['fullname'] ?? null,
                                'email' => $value['email'] ?? null,
                                'status' => 1,
                                'category' => "CONTACT INFORMATION",
                                'created_by' => auth()->user()->id,
                            ]);
                        }
                    }
                }

                // Emergency Contact Information Update & Create
                if (!empty($emergency_contact_list)) {
                    foreach (json_decode($emergency_contact_list, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findContactInformation = \App\Models\ProfileContactInformation::find($value['id']);

                            $findContactInformation->fill([
                                "profile_id" => $profile_id,
                                'fullname' => $value['fullname'] ?? null,
                                'relation' => $value['relation'] ?? null,
                                'address' => $value['address'] ?? null,
                                'contact_number' => $value['contact_number'] ?? null,
                                'category' => "WHOM TO INFORM IN CASE OF EMERGENCY",
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {
                            \App\Models\ProfileContactInformation::create([
                                "profile_id" => $profile_id,
                                'fullname' => $value['fullname'] ?? null,
                                'relation' => $value['relation'] ?? null,
                                'address' => $value['address'] ?? null,
                                'contact_number' => $value['contact_number'] ?? null,
                                'category' => "WHOM TO INFORM IN CASE OF EMERGENCY",
                                'created_by' => auth()->user()->id,
                                'status' => 1,
                            ]);
                        }
                    }
                }

                // Family Information Update & Create
                if (!empty($spouse_list)) {
                    foreach (json_decode($spouse_list, true) as $key => $value) {
                        // If all fields empty
                        if (empty(array_filter($value))) {
                            continue;
                        }

                        if (!empty($value['id'])) {
                            $findSpouse = \App\Models\ProfileSpouse::find($value['id']);

                            $findSpouse->fill([
                                "profile_id" => $profile_id,
                                'civil_status_id' => $value['civil_status_id'] ?? null,
                                'name' => $value['name'] ?? null,
                                'occupation' => $value['occupation'] ?? null,
                                'updated_by' => auth()->user()->id
                            ])->save();

                            // Children Update & Create
                            if (!empty($value['children_list'])) {
                                foreach ($value['children_list'] as $key2 => $value2) {
                                    if (!empty($value2['id'])) {
                                        $findChildren = \App\Models\ProfileChildren::find($value2['id']);

                                        $findChildren->fill([
                                            "profile_id" => $profile_id,
                                            "spouse_id" => $findSpouse->id,
                                            'fullname' => $value2['fullname'] ?? null,
                                            'birthdate' => !empty($value2['birthdate']) ? date("Y-m-d", strtotime($value2['birthdate'])) : null,
                                            'gender' => $value2['gender'] ?? null,
                                            'education_attainment' => $value2['education_attainment'] ?? null,
                                        ])->save();
                                    } else {
                                        \App\Models\ProfileChildren::create([
                                            "profile_id" => $profile_id,
                                            "spouse_id" => $findSpouse->id,
                                            'fullname' => $value2['fullname'] ?? null,
                                            'birthdate' => !empty($value2['birthdate']) ? date("Y-m-d", strtotime($value2['birthdate'])) : null,
                                            'gender' => $value2['gender'] ?? null,
                                            'education_attainment' => $value2['education_attainment'] ?? null,
                                        ]);
                                    }
                                }
                            }
                        } else {
                            $findSpouse = \App\Models\ProfileSpouse::create([
                                "profile_id" => $profile_id,
                                'civil_status_id' => $value['civil_status_id'] ?? null,
                                'name' => $value['name'] ?? null,
                                'occupation' => $value['occupation'] ?? null,
                                'created_by' => auth()->user()->id,
                            ]);

                            // Children Update & Create
                            if (!empty($value['children_list'])) {
                                foreach ($value['children_list'] as $key2 => $value2) {
                                    if (!empty($value2['id'])) {
                                        $findChildren = \App\Models\ProfileChildren::find($value2['id']);

                                        $findChildren->fill([
                                            "profile_id" => $profile_id,
                                            "spouse_id" => $findSpouse->id,
                                            'fullname' => $value2['fullname'] ?? null,
                                            'birthdate' => !empty($value2['birthdate']) ? date("Y-m-d", strtotime($value2['birthdate'])) : null,
                                            'gender' => $value2['gender'] ?? null,
                                            'education_attainment' => $value2['education_attainment'] ?? null,
                                        ])->save();
                                    } else {
                                        \App\Models\ProfileChildren::create([
                                            "profile_id" => $profile_id,
                                            "spouse_id" => $findSpouse->id,
                                            'fullname' => $value2['fullname'] ?? null,
                                            'birthdate' => !empty($value2['birthdate']) ? date("Y-m-d", strtotime($value2['birthdate'])) : null,
                                            'gender' => $value2['gender'] ?? null,
                                            'education_attainment' => $value2['education_attainment'] ?? null,
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }

                // School Attended Update & Create
                if (!empty($school_attended_list)) {
                    foreach (json_decode($school_attended_list, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findSchool = \App\Models\ProfileSchoolAttended::find($value['id']);

                            $findSchool->fill([
                                "profile_id" => $profile_id,
                                'school_level_id' => $value['school_level_id'] ?? null,
                                'school_name' => $value['school_name'] ?? null,
                                'school_type' => $value['school_type'] ?? null,
                                'year_graduated' => $value['year_graduated'] ?? null,
                                'school_address' => $value['school_address'] ?? null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {

                            \App\Models\ProfileSchoolAttended::create([
                                "profile_id" => $profile_id,
                                'school_level_id' => $value['school_level_id'] ?? null,
                                'school_name' => $value['school_name'] ?? null,
                                'school_type' => $value['school_type'] ?? null,
                                'year_graduated' => $value['year_graduated'] ?? null,
                                'school_address' => $value['school_address'] ?? null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Profile Other 1 -OTHER QUALIFICATIONS- Update & Create
                if (!empty($profile_other1)) {
                    foreach (json_decode($profile_other1, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findProfileOther1 = \App\Models\ProfileOther::find($value['id']);

                            $findProfileOther1->fill([
                                "profile_id" => $profile_id,
                                'category' => "OTHER QUALIFICATION ( PROFICIENCY, VOCATIONAL, TECHNICAL, ETC.) INFORMATION",
                                'title' => $value['title'] ?? null,
                                'school_attended' => $value['school_attended'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {
                            \App\Models\ProfileOther::create([
                                "profile_id" => $profile_id,
                                'category' => "OTHER QUALIFICATION ( PROFICIENCY, VOCATIONAL, TECHNICAL, ETC.) INFORMATION",
                                'title' => $value['title'] ?? null,
                                'school_attended' => $value['school_attended'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Profile Other 2 -EXAMINATION TAKEN- Update & Create
                if (!empty($profile_other2)) {
                    foreach (json_decode($profile_other2, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findProfileOther2 = \App\Models\ProfileOther::find($value['id']);

                            $findProfileOther2->fill([
                                "profile_id" => $profile_id,
                                'category' => "EXAMINATIONS TAKEN INFORMATION",
                                'title' => $value['title'] ?? null,
                                'exam_rating' => $value['exam_rating'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {
                            \App\Models\ProfileOther::create([
                                "profile_id" => $profile_id,
                                'category' => "EXAMINATIONS TAKEN INFORMATION",
                                'title' => $value['title'] ?? null,
                                'exam_rating' => $value['exam_rating'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Profile Other 3 -WRITTEN PROJECTS- Update & Create
                if (!empty($profile_other3)) {
                    foreach (json_decode($profile_other3, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findProfileOther3 = \App\Models\ProfileOther::find($value['id']);

                            $findProfileOther3->fill([
                                "profile_id" => $profile_id,
                                'category' => "ARTICLES, RESEARCHES, BOOKS, ETC. WRITTEN INFORMATION",
                                'type' => $value['type'] ?? null,
                                'title' => $value['title'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'source_fund' => $value['source_fund'] ?? null,
                                'status' => $value['status'] ?? null,
                                'publication' => $value['publication'] ?? null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {
                            \App\Models\ProfileOther::create([
                                "profile_id" => $profile_id,
                                'category' => "ARTICLES, RESEARCHES, BOOKS, ETC. WRITTEN INFORMATION",
                                'type' => $value['type'] ?? null,
                                'title' => $value['title'] ?? null,
                                'source_fund' => $value['source_fund'] ?? null,
                                'status' => $value['status'] ?? null,
                                'publication' => $value['publication'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Profile Other 4 -MEMBERSHIP- Update & Create
                if (!empty($profile_other4)) {
                    foreach (json_decode($profile_other4, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findProfileOther4 = \App\Models\ProfileOther::find($value['id']);

                            $findProfileOther4->fill([
                                "profile_id" => $profile_id,
                                'category' => "MEMBERSHIP IN PROFESSIONAL, CULTURAL AND OTHER ORGANIZATION INFORMATION",
                                'title' => $value['title'] ?? null,
                                'position' => $value['position'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {
                            \App\Models\ProfileOther::create([
                                "profile_id" => $profile_id,
                                'category' => "MEMBERSHIP IN PROFESSIONAL, CULTURAL AND OTHER ORGANIZATION INFORMATION",
                                'title' => $value['title'] ?? null,
                                'position' => $value['position'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Profile Other 5 -EDUCATION TRAVEL- Update & Create
                if (!empty($profile_other5)) {
                    foreach (json_decode($profile_other5, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findProfileOther5 = \App\Models\ProfileOther::find($value['id']);

                            $findProfileOther5->fill([
                                "profile_id" => $profile_id,
                                'category' => "EDUCATIONAL TRAVEL INFORMATION",
                                'address' => $value['address'] ?? null,
                                'purpose' => $value['purpose'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'sponsor' => $value['sponsor'] ?? null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {
                            \App\Models\ProfileOther::create([
                                "profile_id" => $profile_id,
                                'category' => "EDUCATIONAL TRAVEL INFORMATION",
                                'address' => $value['address'] ?? null,
                                'purpose' => $value['purpose'] ?? null,
                                'year' => !empty($value['year']) ? date("Y-m-d", strtotime($value['year'])) : null,
                                'sponsor' => $value['sponsor'] ?? null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Profile Other 6 -REFERENCES- Update & Create
                if (!empty($profile_other6)) {
                    foreach (json_decode($profile_other6, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findProfileOther6 = \App\Models\ProfileOther::find($value['id']);

                            $findProfileOther6->fill([
                                "profile_id" => $profile_id,
                                'category' => "REFERENCES AND THEIR ADDRESSES (At least three)",
                                'title' => $value['title'] ?? null,
                                'designation' => $value['designation'] ?? null,
                                'address' => $value['address'] ?? null,
                                'contact_number' => $value['contact_number'] ?? null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {
                            \App\Models\ProfileOther::create([
                                "profile_id" => $profile_id,
                                'category' => "REFERENCES AND THEIR ADDRESSES (At least three)",
                                'title' => $value['title'] ?? null,
                                'designation' => $value['designation'] ?? null,
                                'address' => $value['address'] ?? null,
                                'contact_number' => $value['contact_number'] ?? null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Benificiary Update & Create
                if (!empty($benificiary_list)) {
                    foreach (json_decode($benificiary_list, true) as $key => $value) {

                        // If all fields empty
                        if (empty(array_filter($value))) {
                            continue;
                        }

                        if (!empty($value['id'])) {
                            $findBenificiary = \App\Models\ProfileBenificiary::find($value['id']);

                            $findBenificiary->fill([
                                "profile_id" => $profile_id,
                                'fullname' => $value['fullname'] ?? null,
                                'birthdate' => !empty($value['birthdate']) ? date("Y-m-d", strtotime($value['birthdate'])) : null,
                                'contact_number' => $value['contact_number'] ?? null,
                                'relationship' => $value['relationship'] ?? null,
                                'start_date' => !empty($value['start_date']) ? date("Y-m-d", strtotime($value['start_date'])) : null,
                                'end_date' => !empty($value['end_date']) ? date("Y-m-d", strtotime($value['end_date'])) : null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {

                            \App\Models\ProfileBenificiary::create([
                                "profile_id" => $profile_id,
                                'fullname' => $value['fullname'] ?? null,
                                'birthdate' => !empty($value['birthdate']) ? date("Y-m-d", strtotime($value['birthdate'])) : null,
                                'contact_number' => $value['contact_number'] ?? null,
                                'relationship' => $value['relationship'] ?? null,
                                'start_date' => !empty($value['start_date']) ? date("Y-m-d", strtotime($value['start_date'])) : null,
                                'end_date' => !empty($value['end_date']) ? date("Y-m-d", strtotime($value['end_date'])) : null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Parent Update & Create
                if (!empty($parent_list)) {
                    foreach (json_decode($parent_list, true) as $key => $value) {
                        if (!empty($value['id'])) {
                            $findParent = \App\Models\ProfileParentInformation::find($value['id']);

                            $findParent->fill([
                                "profile_id" => $profile_id,
                                'firstname' => $value['firstname'] ?? null,
                                'middlename' => $value['middlename'] ?? null,
                                'lastname' => $value['lastname'] ?? null,
                                'name_ext' => $value['name_ext'] ?? null,
                                'contact_number' => $value['contact_number'] ?? null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {

                            \App\Models\ProfileParentInformation::create([
                                "profile_id" => $profile_id,
                                'firstname' => $value['firstname'] ?? null,
                                'middlename' => $value['middlename'] ?? null,
                                'lastname' => $value['lastname'] ?? null,
                                'name_ext' => $value['name_ext'] ?? null,
                                'contact_number' => $value['contact_number'] ?? null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Work Experience Update & Create
                if (!empty($work_experience_list)) {
                    foreach (json_decode($work_experience_list, true) as $key => $value) {
                        // If all fields empty
                        if (empty(array_filter($value))) {
                            continue;
                        }

                        if (!empty($value['id'])) {
                            $findWorkExperience = \App\Models\ProfileWorkExperience::find($value['id']);

                            $findWorkExperience->fill([
                                "profile_id" => $profile_id,
                                'employer_name' => $value['employer_name'] ?? null,
                                'govt_service' => $value['govt_service'] ?? null,
                                'start_date' => !empty($value['start_date']) ? date("Y-m-d", strtotime($value['start_date'])) : null,
                                'end_date' => !empty($value['end_date']) ? date("Y-m-d", strtotime($value['end_date'])) : null,
                                'position_id' => $value['position_id'] ?? null,
                                'description' => $value['description'] ?? null,
                                'industry' => $value['industry'] ?? null,
                                'address' => $value['address'] ?? null,
                                'salary' => $value['salary'] ?? null,
                                'updated_by' => auth()->user()->id
                            ])->save();
                        } else {

                            \App\Models\ProfileWorkExperience::create([
                                "profile_id" => $profile_id,
                                'employer_name' => $value['employer_name'] ?? null,
                                'govt_service' => $value['govt_service'] ?? null,
                                'start_date' =>  !empty($value['start_date']) ? date("Y-m-d", strtotime($value['start_date'])) : null,
                                'end_date' => !empty($value['end_date']) ? date("Y-m-d", strtotime($value['end_date'])) : null,
                                'position_id' => $value['position_id'] ?? null,
                                'description' => $value['description'] ?? null,
                                'industry' => $value['industry'] ?? null,
                                'address' => $value['address'] ?? null,
                                'salary' => $value['salary'] ?? null,
                                'created_by' => auth()->user()->id
                            ]);
                        }
                    }
                }

                // Training Certification Update & Create
                if (!empty($training_certificate_list)) {
                    foreach (json_decode($training_certificate_list, true) as $key => $value) {

                        // If all fields empty
                        if (empty(array_filter($value))) {
                            continue;
                        }

                        if (!empty($value['id'])) {
                            $findTrainingCertification = \App\Models\ProfileTrainingCertificate::find($value['id']);

                            $findTrainingCertificationUpdate = $findTrainingCertification->fill([
                                "profile_id" => $profile_id,
                                'title' => $value['title'] ?? null,
                                'description' => $value['description'] ?? null,
                                'provider' => $value['provider'] ?? null,
                                'type_of_certificate' => $value['type_of_certificate'] ?? null,
                                'level_of_certification' => $value['level_of_certification'] ?? null,
                                'date_start_covered' => !empty($value['date_start_covered']) ? date("Y-m-d", strtotime($value['date_start_covered'])) : null,
                                'date_end_covered' => !empty($value['date_end_covered']) ? date("Y-m-d", strtotime($value['date_end_covered'])) : null,
                                'updated_by' => auth()->user()->id,
                            ]);

                            if ($findTrainingCertificationUpdate->save()) {
                                if (!empty($request->training_certificate_file . "$key")) {
                                    $training_certificate_file = $request->training_certificate_file[$key];

                                    foreach ($training_certificate_file as $key2 => $value2) {
                                        $this->create_attachment($findTrainingCertification, $value2, [
                                            "folder_name" => "profiles/profile-$profile_id/training_certificates",
                                            "file_description" => "Training Certificate",
                                        ]);
                                    }
                                }
                            }
                        } else {
                            $findTrainingCertificationCreate = \App\Models\ProfileTrainingCertificate::create([
                                "profile_id" => $profile_id,
                                'title' => $value['title'] ?? null,
                                'description' => $value['description'] ?? null,
                                'provider' => $value['provider'] ?? null,
                                'type_of_certificate' => $value['type_of_certificate'] ?? null,
                                'level_of_certification' => $value['level_of_certification'] ?? null,
                                'date_start_covered' => !empty($value['date_start_covered']) ? date("Y-m-d", strtotime($value['date_start_covered'])) : null,
                                'date_end_covered' => !empty($value['date_end_covered']) ? date("Y-m-d", strtotime($value['date_end_covered'])) : null,
                                'created_by' => auth()->user()->id
                            ]);

                            if ($findTrainingCertificationCreate) {
                                if (!empty($request->training_certificate_file[$key])) {
                                    $training_certificate_file = $request->training_certificate_file[$key];

                                    foreach ($training_certificate_file as $key2 => $value2) {
                                        $this->create_attachment($findTrainingCertificationCreate, $value2, [
                                            "folder_name" => "profiles/profile-$profile_id/training_certificates",
                                            "file_description" => "Training Certificate",
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            $this->user_persmissions($createUser->id, $request->user_role_id);

            $ret = [
                "success" => true,
                "message" => "Data created successfully",
            ];
        }

        return response()->json($ret, 200);
    }

    public function profile_deactivate(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not deactivate"
        ];

        $findProfile = Profile::find($request->id);
        if ($findProfile) {
            $profileUpdate = $findProfile->fill([
                "deactivated_by" => auth()->user()->id,
                "deactivated_at" => now()
            ]);

            if ($profileUpdate->save()) {
                $findUser = User::find($findProfile->user_id);
                if ($findUser) {
                    $findUser->fill([
                        "deactivated_by" => auth()->user()->id,
                        "deactivated_at" => now()
                    ])->save();
                }

                $ret = [
                    "success" => true,
                    "message" => "Data deactivated successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function profile_data_consent(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Consent not saved"
        ];

        $findProfile = Profile::where("id", $request->id)->first();

        if ($findProfile) {
            $findProfile->fill([
                'data_consent' => is_array($request->data_consent) ? implode(', ', $request->data_consent) : $request->data_consent,
            ])->save();

            $ret = [
                "success" => true,
                "message" => "Consent updated successfully"
            ];
        } else {
            $ret = [
                "success" => false,
                "message" => "Profile not found"
            ];
        }

        return response()->json($ret, 200);
    }

    public function upload_signature(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Signature not save"
        ];

        $findProfile = Profile::where("user_id", $request->user_id)->first();

        if ($findProfile && $request->hasFile('signature')) {
            $create_attachment = $this->create_attachment($findProfile, $request->file('signature'), [
                "folder_name" => "profiles/profile-$findProfile->id/signature",
                "file_description" => "Signature",
            ]);

            if ($create_attachment) {
                $findProfileData = Profile::with([
                    "attachments" => function ($query) {
                        $query->orderBy("id", "desc");
                    }
                ])->find($findProfile->user_id);

                $ret = [
                    "success" => true,
                    "message" => "Signature save successfully",
                    "data" => $findProfileData
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function update_profile_photo(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Profile photo not updated"
        ];

        $findProfile = Profile::where("user_id", $request->user_id)->first();

        if ($findProfile && $request->hasFile('profile_picture')) {
            $create_attachment = $this->create_attachment($findProfile, $request->file('profile_picture'), [
                "folder_name" => "profiles/profile-$findProfile->id/profile_pictures",
                "file_description" => "Profile Picture",
            ]);

            if ($create_attachment) {
                $findProfileData = Profile::with([
                    "attachments" => function ($query) {
                        $query->orderBy("id", "desc");
                    }
                ])->find($findProfile->user_id);

                $ret = [
                    "success" => true,
                    "message" => "Signature save successfully",
                    "data" => $findProfileData
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function student_subject_upload_excel(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
            "request" => $request->all()
        ];

        $request->validate([
            'file_excel' => 'required|mimes:xlsx,xls',
        ]);

        if ($request->hasFile('file_excel')) {
            $path = $request->file('file_excel');

            $import = new StudentSubjectImport(["school_year_id" => $request->school_year_id, "semester_id" => $request->semester_id]);
            Excel::import($import, $path);

            $ret = $import->getMessage();
        }

        return response()->json($ret);
    }

    public function faculty_upload_excel(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
            "request" => $request->all()
        ];

        $request->validate([
            'file_excel' => 'required|mimes:xlsx,xls',
        ]);

        if ($request->hasFile('file_excel')) {
            $path = $request->file('file_excel');

            $import = new FacultyImport();
            Excel::import($import, $path);

            $ret = $import->getMessage();
        }

        return response()->json($ret);
    }

    public function profile_grade_file_by_subject_count_report_print(Request $request)
    {
        $fullname = $this->fullname;
        $username = "(SELECT username FROM users WHERE users.id = profiles.user_id)";
        $school_id = "REPLACE(school_id, '-', '')";
        $created_at_formatted = "DATE_FORMAT(profiles.created_at, '%m-%d-%Y')";
        $user_role = "(SELECT (SELECT role FROM user_roles WHERE user_roles.id = users.user_role_id) FROM users WHERE users.id = profiles.user_id)";
        $user_type = "(SELECT (SELECT type FROM user_roles WHERE user_roles.id = users.user_role_id) FROM users WHERE users.id = profiles.user_id)";
        $departments = "(SELECT GROUP_CONCAT(ref_departments.department_name SEPARATOR ', ')
            FROM profile_departments
            JOIN ref_departments ON profile_departments.department_id = ref_departments.id
            WHERE profile_departments.profile_id = profiles.id
            AND profile_departments.status = 1)";

        $data = Profile::select([
            "*",
            DB::raw("$fullname fullname"),
            DB::raw("$username username"),
            DB::raw("$school_id school_id"),
            DB::raw("$user_role user_role"),
            DB::raw("$user_type user_type"),
            DB::raw("$created_at_formatted created_at_formatted"),
            DB::raw("$departments departments"),
        ])
            ->withCount([
                'faculty_loads as faculty_loads_subject' => function ($query) use ($request) {
                    if ($request->from == 'grade_file_status') {
                        $query->whereHas(
                            'grade_files',
                            function ($query) use ($request) {
                                if ($request->grade_file_status == 'Approved') {
                                    $query->whereIn('status', ['Approved', 'Uploaded']);
                                } else if ($request->grade_file_status == 'Approval') {
                                    $query->where('status', 'Uploaded');
                                }
                            }
                        );

                        $query->orWhereDoesntHave('grade_files');
                    } else if ($request->from == 'grade_file_report') {
                        if ($request->grade_file_report_status == 'All') {
                            $query->whereHas(
                                'grade_files',
                                function ($query) {
                                    $query->whereIn('status', ['Uploaded', 'Approved']);
                                }
                            );
                            $query->orWhereDoesntHave('grade_files');
                        } else if ($request->grade_file_report_status == 'NoUpload') {
                            $query->doesntHave('grade_files');
                        } else if ($request->grade_file_report_status == 'Uploaded') {
                            $query->whereHas(
                                'grade_files',
                                function ($query) {
                                    $query->where('status', 'Uploaded');
                                }
                            );
                        } else if ($request->grade_file_report_status == 'Approved') {
                            $query->whereHas(
                                'grade_files',
                                function ($query) {
                                    $query->where('status', 'Approved');
                                }
                            );
                        }
                    }
                },
                'faculty_loads as grade_file_approved' => function ($query) use ($request) {
                    $query->whereHas(
                        'grade_files',
                        function ($query) use ($request) {
                            if ($request->from == 'grade_file_report') {
                                if ($request->grade_file_report_status != 'All') {
                                    $query->where('status', 'Approved');
                                } else {
                                    $query->where('status', 'Approved');
                                }
                            } else {
                                $query->where('status', 'Approved');
                            }
                        }
                    );
                },
                'faculty_loads as grade_file_approval' => function ($query) use ($request) {
                    $query->whereHas(
                        'grade_files',
                        function ($query) use ($request) {
                            if ($request->from == 'grade_file_report') {
                                if ($request->grade_file_report_status != 'All') {
                                    $query->where('status', 'Uploaded');
                                } else {
                                    $query->where('status', 'Uploaded');
                                }
                            } else {
                                $query->where('status', 'Uploaded');
                            }
                        }
                    );
                },
                'faculty_loads as grade_file_no_upload' => function ($query) {
                    $query->doesntHave('grade_files');
                },
            ]);

        $data->where(function ($query) use ($request, $fullname, $username, $school_id, $created_at_formatted) {
            if ($request->search) {
                $query->orWhere(DB::raw("$fullname"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$username"), 'LIKE', "%$request->search%");
                $query->orWhere("primary_email", 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$school_id"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$created_at_formatted"), 'LIKE', "%$request->search%");
            }
        });

        if ($request->status == "Archived") {
            $data->onlyTrashed();
        }

        $find_profile_by_user_id = $this->find_profile_by_user_id($request->user_id);

        if ($request->from) {
            if ($request->from == '/employees/archived') {
                $data->onlyTrashed();
            } else if ($request->from == '/employees/full-time') {
                $data->employmentTypeFullTime();
            } else if ($request->from == '/employees/part-time') {
                $data->employmentTypePartTime();
            } else if ($request->from == '/students') {
                $data->whereHas('user', function ($query) {
                    $query->whereIn('user_role_id', [6, 7]);
                });
                if ($request->status == 'Archived') {
                    $data->onlyTrashed();
                }
            } else if ($request->from == '/faculty') {
                $data->whereIn('employment_type', ['Full-Time', 'Part-Time']);

                if ($request->isTrash) {
                    $data->onlyTrashed();
                } else {
                    $data->whereNull("deactivated_at");
                }
            } else if (in_array($request->from, ['grade_file', 'grade_file_status', 'grade_file_report'])) {
                if (in_array($find_profile_by_user_id->user_role_id, [3, 4])) {
                    if ($find_profile_by_user_id) {
                        $departments = $find_profile_by_user_id->profile_departments->filter(function ($value) {
                            return $value->status == 1;
                        });

                        if ($departments->count() > 0) {
                            $departmentArray = $departments->map(function ($value) {
                                return $value->department_id;
                            })->toArray();

                            $data->whereHas("profile_departments", function ($query) use ($departmentArray) {
                                $query->whereIn("department_id", $departmentArray);
                            });
                        }
                    }
                } else if (in_array($find_profile_by_user_id->user_role_id, [5])) {
                    $data->whereHas('faculty_loads', function ($query) use ($request) {
                        if ($request->school_year_id) {
                            $query->where('school_year_id', $request->school_year_id);
                        }

                        if ($request->semester_id) {
                            $query->where('semester_id', $request->semester_id);
                        }
                    });

                    $data->where('user_id', $find_profile_by_user_id->id);
                }

                if ($request->profile_ids) {
                    $data->whereIn('id', explode(",", $request->profile_ids));
                }

                $data->whereHas('faculty_loads', function ($query) use ($request) {
                    if ($request->from == 'grade_file_status') {
                        if ($request->grade_file_status) {
                            if ($request->grade_file_status == 'Approved') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Approved');
                                });
                            } else if ($request->grade_file_status == 'Approval') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', '!=', 'Approved');
                                });
                            }
                        }

                        if ($request->grade_file_type) {
                            $query->whereHas('grade_files', function ($query) use ($request) {
                                $query->where('type', $request->grade_file_type);
                            });
                        }
                    } else if ($request->from == 'grade_file_report') {
                        if ($request->grade_file_report_status && $request->grade_file_report_status != 'All') {
                            if ($request->grade_file_report_status == 'NoUpload') {
                                $query->doesntHave('grade_files');
                            } else if ($request->grade_file_report_status == 'Uploaded') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Uploaded');
                                });
                            } else if ($request->grade_file_report_status == 'Approved') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Approved');
                                });
                            }
                        }
                    }

                    if ($request->school_year_id) {
                        $query->where('school_year_id', $request->school_year_id);
                    }

                    if ($request->semester_id) {
                        $query->where('semester_id', $request->semester_id);
                    }

                    if ($request->department_id) {
                        $query->where('department_id', $request->department_id);
                    }
                });
            }
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order)  ? $request->sort_order : 'desc');
            }
        } else {
            $data->orderBy('id', 'desc');
        }

        $data = $data->get();

        $system_logo_bg = base64_encode(file_get_contents(public_path("images/fsuu_logo_wobg.png")));
        $system_logo_bg = 'data:image/png;base64,' . $system_logo_bg;

        $system_logo = base64_encode(file_get_contents(public_path("images/logo.png")));
        $system_logo = 'data:image/png;base64,' . $system_logo;

        $guidance_logo = base64_encode(file_get_contents(public_path("images/guidance_logo.png")));
        $guidance_logo = 'data:image/png;base64,' . $guidance_logo;

        $pdf = Pdf::loadView('pdf.profile_grade_file_by_subject_count_report', [
            "data" => $data,
            "system_logo_bg" => $system_logo_bg,
            "system_logo" => $system_logo,
            "guidance_logo" => $guidance_logo,
            "status" => $request->grade_file_report_status
        ]);

        $pdf->getDomPDF()->setHttpContext(
            stream_context_create([
                'ssl' => [
                    'allow_self_signed' => TRUE,
                    'verify_peer' => FALSE,
                    'verify_peer_name' => FALSE,
                ]
            ])
        );
        $pdf->setPaper('A4', 'portrait');
        // $pdf->setPaper('LEGAL', 'portrait');
        // // return $pdf->download('payslip.pdf');
        return $pdf->stream('fsuu-grade-file-by-subject-count-' . date("Y") . '.pdf');
    }

    public function profile_grade_file_report_print(Request $request)
    {
        $fullname = $this->fullname;
        $username = "(SELECT username FROM users WHERE users.id = profiles.user_id)";
        $school_id = "REPLACE(school_id, '-', '')";
        $created_at_formatted = "DATE_FORMAT(profiles.created_at, '%m-%d-%Y')";
        $user_role = "(SELECT (SELECT role FROM user_roles WHERE user_roles.id = users.user_role_id) FROM users WHERE users.id = profiles.user_id)";
        $user_type = "(SELECT (SELECT type FROM user_roles WHERE user_roles.id = users.user_role_id) FROM users WHERE users.id = profiles.user_id)";
        $departments = "(SELECT GROUP_CONCAT(ref_departments.department_name SEPARATOR ', ')
            FROM profile_departments
            JOIN ref_departments ON profile_departments.department_id = ref_departments.id
            WHERE profile_departments.profile_id = profiles.id
            AND profile_departments.status = 1)";

        $data = Profile::select([
            "*",
            DB::raw("$fullname fullname"),
            DB::raw("$username username"),
            DB::raw("$school_id school_id"),
            DB::raw("$user_role user_role"),
            DB::raw("$user_type user_type"),
            DB::raw("$created_at_formatted created_at_formatted"),
            DB::raw("$departments departments"),
        ])->with([
            'faculty_loads' => function ($query) {
                $query->with([
                    'grade_files' => function ($query) {
                        $query->with(['attachments']);
                        $query->where('status', 'Approved');
                        $query->orderBy('id', 'desc');
                    }
                ]);
                $query->whereHas(
                    'grade_files',
                    function ($query) {
                        $query->where('status', 'Approved');
                    }
                );
            },
        ]);

        if ($request->status == "Archived") {
            $data->onlyTrashed();
        }

        $find_profile_by_user_id = $this->find_profile_by_user_id($request->user_id);

        if ($request->from) {
            if (in_array($request->from, ['grade_file', 'grade_file_status', 'grade_file_report'])) {
                if (in_array($find_profile_by_user_id->user_role_id, [3, 4])) {
                    if ($find_profile_by_user_id) {
                        $departments = $find_profile_by_user_id->profile_departments->filter(function ($value) {
                            return $value->status == 1;
                        });

                        if ($departments->count() > 0) {
                            $departmentArray = $departments->map(function ($value) {
                                return $value->department_id;
                            })->toArray();

                            $data->whereHas("profile_departments", function ($query) use ($departmentArray) {
                                $query->whereIn("department_id", $departmentArray);
                            });
                        }
                    }
                } else if (in_array($find_profile_by_user_id->user_role_id, [5])) {
                    $data->whereHas('faculty_loads', function ($query) use ($request) {
                        if ($request->school_year_id) {
                            $query->where('school_year_id', $request->school_year_id);
                        }

                        if ($request->semester_id) {
                            $query->where('semester_id', $request->semester_id);
                        }
                    });

                    $data->where('user_id', $find_profile_by_user_id->id);
                }

                if ($request->profile_ids) {
                    $data->whereIn('id', explode(",", $request->profile_ids));
                }

                $data->whereHas('faculty_loads', function ($query) use ($request) {
                    if ($request->from == 'grade_file_status') {
                        if ($request->grade_file_status) {
                            if ($request->grade_file_status == 'Approved') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Approved');
                                });
                            } else if ($request->grade_file_status == 'Approval') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', '!=', 'Approved');
                                });
                            }
                        }

                        if ($request->grade_file_type) {
                            $query->whereHas('grade_files', function ($query) use ($request) {
                                $query->where('type', $request->grade_file_type);
                            });
                        }
                    } else if ($request->from == 'grade_file_report') {
                        if ($request->grade_file_report_status && $request->grade_file_report_status != 'All') {
                            if ($request->grade_file_report_status == 'NoUpload') {
                                $query->doesntHave('grade_files');
                            } else if ($request->grade_file_report_status == 'Uploaded') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Uploaded');
                                });
                            } else if ($request->grade_file_report_status == 'Approved') {
                                $query->whereHas('grade_files', function ($query) {
                                    $query->where('status', 'Approved');
                                });
                            }
                        }
                    }

                    if ($request->school_year_id) {
                        $query->where('school_year_id', $request->school_year_id);
                    }

                    if ($request->semester_id) {
                        $query->where('semester_id', $request->semester_id);
                    }

                    if ($request->department_id) {
                        $query->where('department_id', $request->department_id);
                    }
                });
            }
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order)  ? $request->sort_order : 'desc');
            }
        } else {
            $data->orderBy('id', 'desc');
        }

        $data = $data->get();

        $data = $data->map(function ($value) {
            $value->faculty_loads = $value->faculty_loads->map(function ($value) {
                $value->grade_files = $value->grade_files->map(function ($value) {
                    $value['attachments'] = collect($value['attachments'])->map(function ($value) {
                        if (file_exists($value['file_path'])) {
                            $pdf_file = base64_encode(file_get_contents($value['file_path']));
                            $value['pdf_file'] = "data:application/pdf;base64," . $pdf_file;
                        } else {
                            $value['pdf_file'] = null; // or handle the error as needed
                        }
                        return $value;
                    });

                    return $value;
                });
                return $value;
            });
            return $value;
        });

        $system_logo_bg = base64_encode(file_get_contents(public_path("images/fsuu_logo_wobg.png")));
        $system_logo_bg = 'data:image/png;base64,' . $system_logo_bg;

        $system_logo = base64_encode(file_get_contents(public_path("images/logo.png")));
        $system_logo = 'data:image/png;base64,' . $system_logo;

        $guidance_logo = base64_encode(file_get_contents(public_path("images/guidance_logo.png")));
        $guidance_logo = 'data:image/png;base64,' . $guidance_logo;

        $pdf = Pdf::loadView('pdf.profile_grade_file_with_pdf_report', [
            "data" => $data,
            "system_logo_bg" => $system_logo_bg,
            "system_logo" => $system_logo,
            "guidance_logo" => $guidance_logo,
            "status" => $request->grade_file_report_status
        ]);

        $pdf->getDomPDF()->setHttpContext(
            stream_context_create([
                'ssl' => [
                    'allow_self_signed' => TRUE,
                    'verify_peer' => FALSE,
                    'verify_peer_name' => FALSE,
                ]
            ])
        );
        $pdf->setPaper('A4', 'portrait');
        // $pdf->setPaper('LEGAL', 'portrait');
        // // return $pdf->download('payslip.pdf');
        return $pdf->stream('fsuu-grade-file-with-pdf-' . date("Y") . '.pdf');
    }

    public function profile_faculty_load_schedule(Request $request)
    {
        $fullname = $this->fullname;

        $data = Profile::select([
            "*",
            DB::raw("$fullname fullname"),
        ])
            ->with([
                'faculty_loads' => function ($query) {
                    $query->with([
                        'faculty_load_schedules'
                    ]);
                }
            ])
            ->whereHas('faculty_loads', function ($query) use ($request) {
                $query->whereHas('faculty_load_schedules', function ($query) use ($request) {
                    if ($request->from == 'FacultyMonitoringAttendance') {
                        $query->whereDoesntHave("faculty_load_monitorings", function ($query) {
                            $query->whereDate("created_at", "=", date('Y-m-d'));
                        });

                        // $data->where(DB::raw("( SELECT count(*) FROM faculty_load_monitorings WHERE faculty_load_id = faculty_loads.id AND DATE ( faculty_load_monitorings.created_at ) = DATE ( NOW()) )"), "=", 0);

                        $query->where(DB::raw("( SELECT
                                                    IF (
                                                        `name` = 'Monday',
                                                        'Mon',
                                                    IF
                                                        (
                                                            `name` = 'Tuesday',
                                                            'Tue',
                                                        IF
                                                            (
                                                                `name` = 'Wednesday',
                                                                'Wed',
                                                            IF
                                                                (
                                                                    `name` = 'Thursday',
                                                                    'Thu',
                                                                IF
                                                                    ( `name` = 'Friday', 'Fri', IF ( `name` = 'Saturday', 'Sat', IF ( `name` = 'Sunday', 'Sun', '' ) ) )
                                                                )
                                                            )
                                                        ))
                                                FROM
                                                    ref_day_schedules
                                                WHERE
                                                    ref_day_schedules.id = day_schedule_id
                                                    ) = DATE_FORMAT(
                                                NOW(), '%a' )"), ">", 0);
                    }
                });
            });

        if ($request->roles) {
            $data->whereHas('user', function ($query) use ($request) {
                $query->whereIn('user_role_id', explode(",", $request->roles));
            });
        }

        $data = $data->get();

        return response()->json([
            "success" => true,
            "data" => $data
        ], 200);
    }
}