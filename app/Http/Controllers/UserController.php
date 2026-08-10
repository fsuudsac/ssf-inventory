<?php

namespace App\Http\Controllers;

use App\Imports\CustomerImport;
use App\Imports\SupplierImport;
use App\Models\Profile;
use App\Models\ProfileAddress;
use App\Models\ProfileDepartment;
use App\Models\Purchase;
use App\Models\SalesOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $fullname = "(SELECT TRIM(CONCAT_WS(' ', firstname, IF(middlename='', NULL, middlename), lastname, IF(name_ext='', NULL, name_ext))) FROM `profiles` WHERE `profiles`.user_id = users.id LIMIT 1)";
        $gender = "(SELECT gender FROM profiles WHERE user_id = users.id LIMIT 1)";
        $contact_no = "(SELECT contact_no FROM profiles WHERE user_id = users.id LIMIT 1)";
        $taxpayer_identification = "(SELECT taxpayer_identification FROM profiles WHERE user_id = users.id LIMIT 1)";
        $company = "(SELECT (SELECT company FROM companies WHERE companies.id = `profiles`.company_id LIMIT 1) FROM `profiles` WHERE `profiles`.user_id = users.id LIMIT 1)";

        $query = User::select([
            "*",
            DB::raw("$fullname fullname"),
            DB::raw("$gender gender"),
            DB::raw("$contact_no contact_no"),
            DB::raw("$taxpayer_identification taxpayer_identification"),
            DB::raw("$company company"),
        ])
            ->with([
                'profile' => function ($query) {
                    $query->with([
                        'profile_addresses',
                        'company'
                    ]);
                }
            ])
            ->where("id", "!=", 1);

        if ($request->search) {
            $query->where(function ($query) use ($request, $fullname, $gender, $contact_no, $taxpayer_identification, $company) {
                $query->orWhere("email", 'LIKE', "%$request->search%")
                    ->orWhere("role", 'LIKE', "%$request->search%")
                    ->orWhere("status", 'LIKE', "%$request->search%")
                    ->orWhere(DB::raw("$fullname"), 'LIKE', "%$request->search%")
                    ->orWhere(DB::raw("$gender"), 'LIKE', "%$request->search%")
                    ->orWhere(DB::raw("$contact_no"), 'LIKE', "%$request->search%")
                    ->orWhere(DB::raw("$taxpayer_identification"), 'LIKE', "%$request->search%")
                    ->orWhere(DB::raw("$company"), 'LIKE', "%$request->search%");
            });
        }

        if ($request->has('roles')) {
            $roles = explode(",", $request->roles);
            $query->whereIn("role", $roles);
        }

        if ($request->status == "Active") {
            $query->where("status", "Active");
        } else if ($request->status == "Archived") {
            $query->where("status", "!=", "Active");
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null' &&
                $request->sort_order != '' && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                if ($request->sort_field == 'created_at_formatted') {
                    $query->orderBy("created_at", $request->sort_order);
                } else if ($request->sort_field == 'company') {
                    $query->orderBy(DB::raw("$company"), $request->sort_order);
                } else if ($request->sort_field == 'address') {
                    $query->orderBy(DB::raw(" (SELECT address FROM profile_addresses WHERE profile_addresses.status = 1 AND profile_addresses.profile_id = ( SELECT profiles.id FROM profiles WHERE profiles.user_id = users.id LIMIT 1 ) LIMIT 1) "), $request->sort_order);
                } else {
                    $query->orderBy($request->sort_field, $request->sort_order);
                }
            }
        } else {
            $query->orderBy(DB::raw("$fullname"), 'asc');
        }

        if ($request->page_size) {
            $data = $query->paginate($request->page_size, ['*'], 'page', $request->page);
        } else {
            $data = $query->get();
        }

        return response()->json([
            'success' => true,
            'data' => $data,
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
            "message" => "Failed to " . ($request->id ? "update" : "create") . " user.",
        ];

        $request->validate([
            "firstname" => "required",
            "role"      => "required",
        ]);

        $email = null;

        if (!in_array($request->role, ['Customer', 'Supplier'])) {
            $email = $request->email;

            $request->validate([
                "email" => [
                    "required",
                    Rule::unique("users")->ignore($request->id),
                    function ($attribute, $value, $fail) use ($request) {
                        $existingUser = User::where("username", $value)->first();
                        if ($existingUser && $existingUser->id != $request->id) {
                            $fail("The email has already been taken.");
                        }
                    },
                ],
                "username" => [
                    "required",
                    Rule::unique("users")->ignore($request->id),
                    function ($attribute, $value, $fail) use ($request) {
                        $existingUser = User::where("email", $value)->first();
                        if ($existingUser && $existingUser->id != $request->id) {
                            $fail("The username has already been taken.");
                        }
                    },
                ],
            ]);

            if (!$request->id) {
                $request->validate(["password" => "required"]);
            }
        } else {
            $email = $this->generateEmail($request->firstname, $request->lastname, $request->hostname);
        }

        try {
            DB::transaction(function () use ($request, $email, &$ret) {
                $username = $request->username ?: ($email ? explode("@", $email)[0] : "");

                $data = [
                    "username" => $username,
                    "email"    => $email,
                    "role"     => $request->role,
                ];

                if ($request->status) {
                    $data["status"] = $request->status;
                }

                if ($request->password) {
                    $data["password"] = Hash::make($request->password);
                }

                if ($request->id) {
                    $data["updated_by"] = Auth::id();
                } else {
                    $data["created_by"]        = Auth::id();
                    $data["remember_token"]    = Str::random(10);
                    $data["email_verified_at"] = now();
                }

                $dataUser = User::updateOrCreate(
                    ["id" => $request->id ?? null],
                    $data
                );

                if ($dataUser) {
                    if (!in_array($request->role, ["Customer", "Supplier"]) && !$request->id) {
                        $this->createUserPermission($dataUser->id, $request->role);
                    }

                    if ($request->hasFile("profile_picture")) {
                        $this->create_attachment($dataUser, $request->file("profile_picture"), [
                            "folder_name"      => "users/user-$dataUser->id/profile_picture",
                            "file_description" => "Profile Picture",
                        ]);
                    }

                    $dataProfile = [
                        "user_id"    => $dataUser->id,
                        "firstname"  => $request->firstname,
                        "lastname"   => $request->lastname,
                        "middlename" => $request->middlename,
                        "name_ext"   => $request->name_ext,
                        "gender"     => $request->gender,
                        "contact_no" => $request->contact_no,
                    ];

                    if ($request->has("salutation")) {
                        $dataProfile["salutation"] = $request->salutation;
                    }
                    if ($request->has("customer_type")) {
                        $dataProfile["customer_type"] = $request->customer_type;
                    }
                    if ($request->has("taxpayer_identification")) {
                        $dataProfile["taxpayer_identification"] = $request->taxpayer_identification;
                    }
                    if ($request->has("company_id")) {
                        $dataProfile["company_id"] = $request->company_id;
                    }

                    $createProfile = Profile::updateOrCreate(
                        ["user_id" => $dataUser->id],
                        $dataProfile
                    );

                    if ($createProfile) {
                        // Handle single address field
                        if ($request->has("address")) {
                            $findProfileAddress = ProfileAddress::where("profile_id", $createProfile->id)
                                ->where("status", 1)->first();

                            if ($findProfileAddress) {
                                $findProfileAddress->update([
                                    "address"    => $request->address ?? "",
                                    "status"     => 1,
                                    "type"       => $request->type ?? "Bill",
                                    "updated_by" => Auth::id(),
                                ]);
                            } else {
                                ProfileAddress::create([
                                    "profile_id" => $createProfile->id,
                                    "address"    => $request->address ?? "",
                                    "type"       => $request->type ?? "Bill",
                                    "status"     => 1,
                                    "created_by" => Auth::id(),
                                ]);
                            }
                        }

                        // Handle billing addresses
                        if ($request->has("profile_address_bills")) {
                            $profile_address_bills = json_decode($request->profile_address_bills);

                            foreach ($profile_address_bills as $value) {
                                $addrData = [
                                    "profile_id" => $createProfile->id,
                                    "address"    => $value->address ?? "",
                                    "status"     => $value->status ?? 0,
                                    "type"       => "Bill",
                                ];

                                $addrData[!empty($value->id) ? "updated_by" : "created_by"] = Auth::id();

                                ProfileAddress::updateOrCreate(
                                    ["id" => !empty($value->id) ? $value->id : null],
                                    $addrData
                                );
                            }
                        }

                        // Handle shipping addresses
                        if ($request->has("profile_address_ships")) {
                            $profile_addresses = json_decode($request->profile_address_ships);

                            foreach ($profile_addresses as $value) {
                                $addrData = [
                                    "profile_id" => $createProfile->id,
                                    "address"    => $value->address ?? "",
                                    "status"     => $value->status ?? 0,
                                    "type"       => "Ship",
                                ];

                                $addrData[!empty($value->id) ? "updated_by" : "created_by"] = Auth::id();

                                ProfileAddress::updateOrCreate(
                                    ["id" => !empty($value->id) ? $value->id : null],
                                    $addrData
                                );
                            }
                        }
                    }

                    $dataUser = User::with([
                        "attachments" => fn($q) => $q->orderBy("id", "desc"),
                        "profile.profile_addresses",
                    ])->find($dataUser->id);

                    $ret = [
                        "success" => true,
                        "message" => "User " . ($request->id ? "updated" : "created") . " successfully.",
                        "data"    => $dataUser,
                    ];
                }
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = User::with([
            "attachments" => fn($q) => $q->orderBy("id", "desc"),
            "profile.profile_addresses",
        ])->find($id);

        return response()->json([
            "success" => true,
            "data"    => $data,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $ret  = [
            "success" => false,
            "message" => "Data not deleted",
        ];

        $findUser = User::find($id);

        if ($findUser) {
            if ($findUser->delete()) {
                $ret  = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }



    public function create_user($request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not created",
        ];

        $error = false;

        $usersInfo = [
            "user_role_id" => $request->user_role_id,
            "username" => $request->username,
            "email" => $request->email,
            "password" => Hash::make($request->password),
            "created_by" => Auth::id(),
            "status" => 'Active',
        ];

        $findSchoolId = Profile::firstWhere('school_id', $request->school_id);

        if ($findSchoolId) {
            if ($findSchoolId->user_id != "") {
                $error = true;

                $ret = [
                    "success" => true,
                    "message" => "School ID already exist and already taken by other user",
                ];
            }
        }

        if ($error == false) {
            $createUser = User::create($usersInfo);

            if ($createUser) {
                $dataProfile = [
                    "firstname" => $request->firstname,
                    "lastname" => $request->lastname,
                    "user_id" => $createUser->id,
                    "school_id" => $request->school_id,
                    "gender" => $request->gender,
                ];

                $profile_id = "";

                $findProfilByUserId = \App\Models\Profile::where('user_id', $createUser->id)->first();

                if ($findProfilByUserId) {
                    $profile_id = $findProfilByUserId->id;
                    $dataProfile["updated_by"] = Auth::id();
                    $findProfilByUserIdUpdate = $findProfilByUserId->fill($dataProfile);
                    $findProfilByUserIdUpdate->save();

                    if ($request->hasFile('imagefile')) {
                        $folder_name = "";

                        if ($findProfilByUserId->folder_name) {
                            $folder_name = $findProfilByUserId->folder_name;
                        } else {
                            $folder_name = Str::random(10);
                        }

                        $this->create_attachment($findProfilByUserId, $request->file('imagefile'), [
                            "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                            "file_description" => "Profile",
                        ]);
                    }
                } else {
                    $dataProfile["created_by"] = Auth::id();
                    $createProfile = \App\Models\Profile::create($dataProfile);

                    if ($createProfile) {
                        $profile_id = $createProfile->id;

                        if ($request->hasFile('imagefile')) {
                            $folder_name = Str::random(10);
                            $this->create_attachment($createProfile, $request->file('imagefile'), [
                                "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                                "file_description" => "Profile",
                            ]);
                        }
                    }
                }

                $department_id = $request->department_id;
                $contact_number = $request->contact_number;

                if ($profile_id != "") {
                    if ($department_id != "") {
                        \App\Models\ProfileDepartment::where("profile_id", $profile_id)->update(['status' => 0]);

                        $findDepartment = ProfileDepartment::where("department_id", $department_id)
                            ->where("profile_id", $profile_id)->first();

                        if ($findDepartment) {
                            $findDepartment->fill([
                                'status' => 1,
                                'updated_by' => Auth::id()
                            ])->save();
                        } else {
                            \App\Models\ProfileDepartment::create([
                                'department_id' => $department_id,
                                "profile_id" => $profile_id,
                                'status' => 1,
                                'updated_by' => Auth::id()
                            ]);
                        }
                    }

                    if ($contact_number != "") {
                        \App\Models\ProfileContactInformation::where("profile_id", $profile_id)->update(['status' => 0]);

                        $findContactInformation = \App\Models\ProfileContactInformation::where("contact_number", $contact_number)
                            ->where("profile_id", $profile_id)->first();

                        if ($findContactInformation) {
                            $findContactInformation->fill([
                                'status' => 1,
                                'updated_by' => Auth::id()
                            ])->save();
                        } else {
                            \App\Models\ProfileContactInformation::create([
                                'contact_number' => $contact_number,
                                "profile_id" => $profile_id,
                                'status' => 1,
                                'created_by' => Auth::id()
                            ]);
                        }
                    }
                }

                $this->user_persmissions($createUser->id, $request->user_role_id);

                $ret = [
                    "success" => true,
                    "message" => "refresh",
                ];
            }
        }

        return $ret;
    }

    public function update_user($request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
        ];

        $usersInfo = [
            "user_role_id" => $request->user_role_id,
            "updated_by" => Auth::id()
        ];

        if ($request->password) {
            $usersInfo['password'] = Hash::make($request->password);
        }

        // Update User
        $finduser = User::find($request->id);

        if ($finduser) {
            $finduserUpdate = $finduser->fill($usersInfo);
            $finduserUpdate->save();

            $dataProfile = [
                "firstname" => $request->firstname,
                "lastname" => $request->lastname,
                "user_id" => $finduser->id,
                "school_id" => $request->school_id,
                "civil_status_id" => $request->civil_status_id,
                "nationality_id" => $request->nationality_id,
                "gender" => $request->gender,
            ];

            $profile_id = "";

            $findProfilByUserId = \App\Models\Profile::where('user_id', $finduser->id)->first();

            if ($findProfilByUserId) {
                $profile_id = $findProfilByUserId->id;

                $dataProfile["updated_by"] = Auth::id();

                $findProfilByUserIdUpdate = $findProfilByUserId->fill($dataProfile);
                $findProfilByUserIdUpdate->save();

                if ($request->hasFile('imagefile')) {
                    $folder_name = "";

                    if ($findProfilByUserId->folder_name) {
                        $folder_name = $findProfilByUserId->folder_name;
                    } else {
                        $folder_name = Str::random(10);
                    }

                    $this->create_attachment($findProfilByUserId, $request->file('imagefile'), [
                        "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                        "file_description" => "Profile",
                    ]);
                }
            } else {
                $dataProfile["created_by"] = Auth::id();
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
            $contact_number = $request->contact_number;

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
                            "updated_by" => Auth::id(),
                        ])->save();
                    } else {
                        \App\Models\ProfileDepartment::create([
                            'department_id' => $department_id,
                            "profile_id" => $profile_id,
                            "created_by" => Auth::id(),
                            'status' => 1,
                        ]);
                    }
                }

                // Contact Information Update & Create
                if ($contact_number != "") {
                    \App\Models\ProfileContactInformation::where("profile_id", $profile_id)->update(['status' => 0]);

                    $findContactInformation = \App\Models\ProfileContactInformation::where("contact_number", $contact_number)
                        ->where("profile_id", $profile_id)
                        ->first();

                    if ($findContactInformation) {
                        $findContactInformation->fill([
                            "status" => 1,
                            "updated_by" => Auth::id(),
                        ])->save();
                    } else {
                        \App\Models\ProfileContactInformation::create([
                            'contact_number' => $contact_number,
                            "profile_id" => $profile_id,
                            "created_by" => Auth::id(),
                            'status' => 1,
                        ]);
                    }
                }
            }

            $this->user_persmissions($finduser->id, $request->user_role_id);

            $ret = [
                "success" => true,
                "message" => "Data updated successfully",
            ];
        }

        return $ret;
    }

    public function add_user(Request $request)
    {
        $ret  = [
            "success" => true,
            "message" => "Data not created",
        ];

        $data = [
            "user_role_id" => $request->user_role_id,
            "username" => $request->username,
            "email" => $request->email,
            "password" => Hash::make($request->password),
            "created_by" => Auth::id(),
            "status" => 'Active',
        ];

        if ($request->id) {
            $data += [
                "updated_by" => Auth::id()
            ];
        } else {
            $data += [
                "created_by" => Auth::id()
            ];
        }

        $subject = User::updateOrCreate([
            "id" => $request->id,
        ], $data);
    }

    public function users_update_email(Request $request)
    {
        $ret  = [
            "success" => true,
            "message" => "Email not updated",
        ];

        $data = User::find($request->id);

        if ($data) {
            $data = $data->fill(["email" => $request->email]);
            if ($data->save()) {
                $ret  = [
                    "success" => true,
                    "message" => "Email updated successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function users_update_password(Request $request)
    {
        $ret  = [
            "success" => false,
            "message" => "Password not updated",
        ];

        $data = User::find($request->id);

        if ($data) {
            $data = $data->fill(["password" => Hash::make($request->new_password)]);
            if ($data->save()) {
                $ret  = [
                    "success" => true,
                    "message" => "Password updated successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function users_info_update_password(Request $request)
    {
        $ret  = [
            "success" => false,
            "message" => "Password not updated",
        ];

        $data = User::find($request->id);

        if ($data) {
            if (Hash::check($request->old_password, $data->password)) {
                $data = $data->fill(["password" => Hash::make($request->new_password)]);
                if ($data->save()) {
                    $ret  = [
                        "success" => true,
                        "message" => "Password updated successfully"
                    ];
                }
            } else {
                $ret  = [
                    "success" => false,
                    "message" => "Old password did not match",
                ];
            }
        } else {
            $ret  = [
                "success" => false,
                "message" => "No found data",
            ];
        }

        return response()->json($ret, 200);
    }

    public function user_update_role(Request $request)
    {
        $ret  = [
            "success" => false,
            "message" => "User role not updated",
        ];

        $findUser = User::find($request->id);

        if ($findUser) {
            if ($findUser->status === 'Active') {
                $findUser = $findUser->fill(["user_role_id" => $request->type, "user_role_id" => $request->user_role_id]);
                if ($findUser->save()) {
                    $ret  = [
                        "success" => true,
                        "message" => "User role updated successfully"
                    ];
                }
            }
        }

        return response()->json($ret, 200);
    }

    public function user_deactivate(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not deactivate"
        ];

        $findUser = User::find($request->id);

        if ($findUser) {
            if ($findUser->status === 'Active') {
                // deactivate user
                $findUser->status = 'Deactivated';
                $findUser->deactivated_by = Auth::id();
                $findUser->deactivated_at = now();

                if ($findUser->save()) {
                    $findUserProfile = Profile::where('id', $findUser->id)->first();

                    if ($findUserProfile) {
                        $findUserProfile->deactivated_by = Auth::id();
                        $findUserProfile->deactivated_at = now();
                        $findUserProfile->save();
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Data deactivated successfully"
                    ];
                }
            }
        } else {
            $ret = [
                "success" => false,
                "message" => "Failed to deactivate data"
            ];
        }

        return response()->json($ret, 200);
    }

    public function multiple_archived_user(Request $request)
    {
        $ret = [
            'success' => false,
            'message' => 'Data not archived!',
            'data' => $request->ids
        ];

        if ($request->has('ids') && count($request->ids) > 0) {
            foreach ($request->ids as $key => $value) {
                $findUser = User::find($value);

                if ($findUser) {
                    if ($request->isTrash == 0) {
                        $findUser->fill([
                            'deactivated_by' => Auth::id(),
                            'deactivated_at' => now(),
                            'status' => 'Archived'
                        ])->save();
                    } else if ($request->isTrash == 1) {
                        $findUser->fill([
                            'deactivated_by' => NULL,
                            'deactivated_at' => NULL,
                            'status' => 'Active'
                        ])->save();
                    }
                }
            }

            $ret = [
                'success' => true,
                'message' => 'Data ' . ($request->isTrash == 1 ? 'activated ' : 'archived') . ' successfully!',
            ];
        }

        return response()->json($ret, 200);
    }

    public function user_profile_info()
    {
        $data = User::with([
            "user_role",
            "profile" => function ($query) {
                $query->with([
                    "attachments" => function ($query1) {
                        $query1->orderBy("id", "desc")->limit(1);
                    },
                ]);
            }
        ])->find(Auth::id());

        return response()->json([
            "success" => true,
            "data" => $data
        ], 200);
    }

    public function user_profile_info_update(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated.",
        ];

        $data = User::find(Auth::id());

        if ($data) {
            $findProfile = Profile::where("user_id", $data->id)->first();

            if ($findProfile) {
                $findProfile->fill([
                    "firstname"  => $request->firstname,
                    "lastname"   => $request->lastname,
                    "middlename" => $request->middlename,
                    "name_ext"   => $request->name_ext,
                    "gender"     => $request->gender,
                    "contact_no" => $request->contact_no,
                ])->save();
            }

            $ret = [
                "success" => true,
                "message" => "Data updated successfully.",
            ];
        }

        return response()->json($ret, 200);
    }

    public function user_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->status == "Active" ? "archive" : "restore") . " user.",
        ];

        $findUser = User::find($request->id);

        if ($findUser) {
            if ($request->status == "Active") {
                $findUser->fill([
                    "status"         => "Deactivated",
                    "deactivated_by" => Auth::id(),
                    "deactivated_at" => now(),
                ])->save();
            } else {
                $findUser->fill([
                    "status"         => "Active",
                    "deactivated_by" => null,
                    "deactivated_at" => null,
                ])->save();
            }

            $ret = [
                "success" => true,
                "message" => "User " . ($request->status == "Active" ? "archived" : "restored") . " successfully.",
            ];
        }

        return response()->json($ret, 200);
    }

    public function multiple_archived_customer(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->status == "Active" ? "archive" : "restore") . " customers.",
        ];

        // Block archiving if any customer has existing sales orders
        $hasSalesOrders = SalesOrder::whereIn("customer_id", $request->ids)->exists();

        if ($hasSalesOrders) {
            return response()->json([
                "success" => false,
                "message" => "Cannot archive customer with existing sales orders.",
            ], 200);
        }

        try {
            DB::transaction(function () use ($request, &$ret) {
                foreach ($request->ids as $id) {
                    $findCustomer = User::find($id);

                    if ($findCustomer) {
                        if ($request->status == "Active") {
                            $findCustomer->fill([
                                "status"         => "Deactivated",
                                "deactivated_by" => Auth::id(),
                                "deactivated_at" => now(),
                            ])->save();
                        } else {
                            $findCustomer->fill([
                                "status"         => "Active",
                                "deactivated_by" => null,
                                "deactivated_at" => null,
                            ])->save();
                        }
                    }
                }

                $ret = [
                    "success" => true,
                    "message" => "Customers " . ($request->status == "Active" ? "archived" : "restored") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function multiple_archived_supplier(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->status == "Active" ? "archive" : "restore") . " suppliers.",
        ];

        // Block archiving if any supplier has existing purchases
        $hasPurchases = Purchase::whereIn("supplier_id", $request->ids)->exists();

        if ($hasPurchases) {
            return response()->json([
                "success" => false,
                "message" => "Cannot archive supplier with existing purchases.",
            ], 200);
        }

        try {
            DB::transaction(function () use ($request, &$ret) {
                foreach ($request->ids as $id) {
                    $findSupplier = User::find($id);

                    if ($findSupplier) {
                        if ($request->status == "Active") {
                            $findSupplier->fill([
                                "status"         => "Deactivated",
                                "deactivated_by" => Auth::id(),
                                "deactivated_at" => now(),
                            ])->save();
                        } else {
                            $findSupplier->fill([
                                "status"         => "Active",
                                "deactivated_by" => null,
                                "deactivated_at" => null,
                            ])->save();
                        }
                    }
                }

                $ret = [
                    "success" => true,
                    "message" => "Suppliers " . ($request->status == "Active" ? "archived" : "restored") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function user_profile_picture(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Profile picture not updated.",
        ];

        $findUser = User::with("attachments")->find($request->user_id);

        if ($findUser && $request->hasFile("profile_picture")) {
            $create_attachment = $this->create_attachment($findUser, $request->file("profile_picture"), [
                "action"           => "Add",
                "folder_name"      => "users/user-$findUser->id/profile_picture",
                "file_description" => "Profile Picture",
                "file_type"        => "image",
            ]);

            if ($create_attachment) {
                $findUser = User::with("attachments")->find($request->user_id);

                $ret = [
                    "success" => true,
                    "message" => "Profile picture saved successfully.",
                    "data"    => $findUser,
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function user_upload_signature(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Signature not updated.",
        ];

        $findUser = User::with("attachments")->find($request->user_id);

        if ($findUser && $request->hasFile("signature")) {
            $create_attachment = $this->create_attachment($findUser, $request->file("signature"), [
                "action"           => "Add",
                "folder_name"      => "users/user-$findUser->id/signature",
                "file_description" => "Signature",
                "file_type"        => "image",
            ]);

            if ($create_attachment) {
                $findUser = User::with("attachments")->find($request->user_id);

                $ret = [
                    "success" => true,
                    "message" => "Signature saved successfully.",
                    "data"    => $findUser,
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function customer(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->id ? "update" : "create") . " customer.",
        ];

        $request->validate([
            "firstname"        => "required",
            "customer_type"    => "required",
            "contact_no"       => "required",
            "profile_addresses" => "required|array",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret) {
                $username = explode("@", $request->email)[0];

                $data = [
                    "username" => $username,
                    "email"    => $request->email,
                    "role"     => $request->role ?? "Customer",
                ];

                if ($request->password) {
                    $data["password"] = Hash::make($request->password);
                }

                if ($request->id) {
                    $data["updated_by"] = Auth::id();
                } else {
                    $data["created_by"]     = Auth::id();
                    $data["remember_token"] = Str::random(10);

                    if (in_array($request->role, ["Supplier", "Customer"])) {
                        $data["status"] = "Active";
                    }
                }

                if ($request->status) {
                    $data["status"] = $request->status;
                }

                $dataUser = User::updateOrCreate(["id" => $request->id], $data);

                if ($dataUser) {
                    $dataProfile = [
                        "user_id"    => $dataUser->id,
                        "firstname"  => $request->firstname,
                        "lastname"   => $request->lastname,
                        "middlename" => $request->middlename,
                        "contact_no" => $request->contact_no,
                    ];

                    if ($request->salutation) {
                        $dataProfile["salutation"] = $request->salutation;
                    }
                    if ($request->company_id) {
                        $dataProfile["company_id"] = $request->company_id;
                    }
                    if ($request->taxpayer_identification) {
                        $dataProfile["taxpayer_identification"] = $request->taxpayer_identification;
                    }
                    if ($request->customer_type) {
                        $dataProfile["customer_type"] = $request->customer_type;
                    }

                    $createProfile = Profile::updateOrCreate(
                        ["user_id" => $dataUser->id],
                        $dataProfile
                    );

                    if ($createProfile && $request->profile_addresses) {
                        $existingAddresses = ProfileAddress::where("profile_id", $createProfile->id)->get();
                        $requestAddresses  = collect($request->profile_addresses)->pluck("address")->toArray();

                        // Deactivate addresses removed from the request
                        foreach ($existingAddresses as $existing) {
                            if (!in_array($existing->address, $requestAddresses)) {
                                $existing->status     = 0;
                                $existing->updated_by = Auth::id();
                                $existing->save();
                            }
                        }

                        foreach ($request->profile_addresses as $value) {
                            $addrData = [
                                "profile_id" => $createProfile->id,
                                "address"    => $value["address"],
                                "status"     => 1,
                            ];

                            $addrData[!empty($value["id"]) ? "updated_by" : "created_by"] = Auth::id();

                            ProfileAddress::updateOrCreate(
                                ["id" => !empty($value["id"]) ? $value["id"] : null],
                                $addrData
                            );
                        }
                    }
                }

                $ret = [
                    "success" => true,
                    "message" => "Customer " . ($request->id ? "updated" : "created") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function supplier(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Failed to " . ($request->id ? "update" : "create") . " supplier.",
        ];

        $findProfile = Profile::where("user_id", $request->id)->first();

        $request->validate([
            "email"             => ["required", "unique:users,email," . $request->id],
            "firstname"         => ["required", "unique:profiles,firstname," . ($findProfile?->id)],
            "contact_no"        => "required",
            "profile_addresses" => "required|array",
        ]);

        try {
            DB::transaction(function () use ($request, &$ret) {
                $username = explode("@", $request->email)[0];

                $data = [
                    "username" => $username,
                    "email"    => $request->email,
                ];

                if ($request->password) {
                    $data["password"] = Hash::make($request->password);
                }

                if ($request->id) {
                    $data["updated_by"] = Auth::id();
                } else {
                    $data["created_by"]     = Auth::id();
                    $data["remember_token"] = Str::random(10);
                    $data["status"]         = "Active";
                    $data["role"]           = "Supplier";
                }

                $dataUser = User::updateOrCreate(["id" => $request->id], $data);

                if ($dataUser) {
                    $dataProfile = [
                        "user_id"                 => $dataUser->id,
                        "firstname"               => $request->firstname,
                        "lastname"                => $request->lastname,
                        "middlename"              => $request->middlename,
                        "salutation"              => $request->salutation,
                        "company_id"              => $request->company_id,
                        "contact_no"              => $request->contact_no,
                        "taxpayer_identification" => $request->taxpayer_identification,
                    ];

                    $createProfile = Profile::updateOrCreate(
                        ["user_id" => $dataUser->id],
                        $dataProfile
                    );

                    if ($createProfile && $request->profile_addresses) {
                        $existingAddresses = ProfileAddress::where("profile_id", $createProfile->id)->get();
                        $requestAddresses  = collect($request->profile_addresses)->pluck("address")->toArray();

                        // Deactivate addresses removed from the request
                        foreach ($existingAddresses as $existing) {
                            if (!in_array($existing->address, $requestAddresses)) {
                                $existing->status     = 0;
                                $existing->updated_by = Auth::id();
                                $existing->save();
                            }
                        }

                        foreach ($request->profile_addresses as $value) {
                            $addrData = [
                                "profile_id" => $createProfile->id,
                                "address"    => $value["address"],
                                "status"     => 1,
                            ];

                            $addrData[!empty($value["id"]) ? "updated_by" : "created_by"] = Auth::id();

                            ProfileAddress::updateOrCreate(
                                ["id" => !empty($value["id"]) ? $value["id"] : null],
                                $addrData
                            );
                        }
                    }
                }

                $ret = [
                    "success" => true,
                    "message" => "Supplier " . ($request->id ? "updated" : "created") . " successfully.",
                ];
            });
        } catch (\Throwable $th) {
            $ret["message"] = "An error occurred: " . $th->getMessage();
        }

        return response()->json($ret, 200);
    }

    public function users_customer()
    {
        $fullname = "(SELECT TRIM(CONCAT_WS(' ', firstname, IF(middlename='', NULL, middlename), lastname, IF(name_ext='', NULL, name_ext))) FROM profiles WHERE user_id = users.id)";

        $data = User::select(["*", DB::raw("$fullname fullname")])
            ->with([
                "profile" => fn($q) => $q->with([
                    "company",
                    "profile_addresses" => fn($q) => $q->select("*"),
                ])
            ])
            ->where("role", "Customer")
            ->orderBy(DB::raw("$fullname"), "asc")
            ->get();

        $data->each(function ($user) {
            if (!$user->profile || !$user->profile->profile_addresses) {
                $user->profile->profile_addresses = collect();
            }
        });

        return response()->json(["success" => true, "data" => $data], 200);
    }

    public function users_supplier()
    {
        $fullname = "(SELECT TRIM(CONCAT_WS(' ', firstname, IF(middlename='', NULL, middlename), lastname, IF(name_ext='', NULL, name_ext))) FROM profiles WHERE user_id = users.id)";

        $data = User::select(["*", DB::raw("$fullname fullname")])
            ->with(["profile.profile_addresses"])
            ->where("role", "Supplier")
            ->get();

        return response()->json(["success" => true, "data" => $data], 200);
    }

    public function users_supplier_company()
    {
        $data = User::where("role", "Supplier")->get();

        $profiles = Profile::whereIn("user_id", $data->pluck("id"))->get();

        $data = $data->map(function ($item) use ($profiles) {
            $profile = $profiles->firstWhere("user_id", $item->id);
            if ($profile) {
                $item->company = $profile->company;
            }
            return $item;
        });

        return response()->json(["success" => true, "data" => $data], 200);
    }

    public function upload_suppliers(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated.",
        ];

        $request->validate(["file_excel" => "required|mimes:xls,xlsx"]);

        if ($request->hasFile("file_excel")) {
            $import = new SupplierImport(["link_origin" => $request->link_origin]);
            Excel::import($import, $request->file("file_excel"));
            $ret = $import->getMessage();
        }

        return response()->json($ret);
    }

    public function upload_customers(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated.",
        ];

        $request->validate(["file_excel" => "required|mimes:xls,xlsx"]);

        if ($request->hasFile("file_excel")) {
            $import = new CustomerImport(["link_origin" => $request->link_origin]);
            Excel::import($import, $request->file("file_excel"));
            $ret = $import->getMessage();
        }

        return response()->json($ret);
    }

    public function generateEmail($firstname, $lastname, $hostname)
    {
        $parts = array_filter([
            str_replace([" ", ".", ","], "", $firstname),
            str_replace([" ", ".", ","], "", $lastname),
        ]);

        $base    = Str::lower(implode("", $parts));
        $email   = "$base@$hostname";
        $counter = 1;

        while (User::where("email", $email)->exists()) {
            $email = "{$base}{$counter}@{$hostname}";
            $counter++;
        }

        return $email;
    }

    public function existing_username(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not exist"
        ];

        $request->validate([
            'username' => 'required',
        ]);

        try {
            $findUsername = User::where("username", $request->username)->first();

            if ($findUsername) {

                $isActive = $findUsername->status !== 'Deactivated' ? true : false;

                if ($isActive === true) {
                    return response()->json([
                        "success" => true,
                        "message" => "User found",
                        "user_id" => $findUsername->id,
                    ], 200);
                } else {
                    return response()->json([
                        "success" => false,
                        "message" => "Username already exist but deactivated",
                        "user_id" => $findUsername->id,
                    ], 200);
                }
            }
        } catch (\Exception $e) {
            $ret = [
                "success" => false,
                "message" => "Data error: " . $e->getMessage(),
            ];
        }

        $ret += [
            "request" => $request->all()
        ];

        return response()->json($ret, 200);
    }
}
