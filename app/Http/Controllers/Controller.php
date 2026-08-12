<?php

namespace App\Http\Controllers;

use App\Events\NotificationPusherEvent;
use App\Models\EmailTemplate;
use App\Models\HistoricalData;
use App\Models\Inventory;
use App\Models\Notification;
use App\Models\NotificationUser;
use App\Models\UserPayment;
use App\Models\UserPermission;
use App\Models\UserRolePermission;
use App\Models\Warehouse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

abstract class Controller
{
    public $fullname = "TRIM(CONCAT_WS(' ', IF(lastname IS NOT NULL AND lastname != '', CONCAT(lastname, ','), ''), firstname, IF(middlename='', NULL, middlename), IF(name_ext='', NULL, name_ext)))";

    public function authFullname()
    {
        $profile = Auth::user()->profile ?? null;

        if ($profile) {
            $lastname = $profile->lastname ?? '';
            $firstname = $profile->firstname ?? '';
            $middlename = $profile->middlename ?? '';
            $nameExt = $profile->name_ext ?? '';

            // Lastname with comma IF present and non-empty
            $lastWithComma = ($lastname !== null && $lastname !== '')
                ? $lastname . ','
                : '';

            // Middlename: treat empty string as NULL (i.e., skip it)
            $middlePart = ($middlename === '') ? null : $middlename;

            // Name extension: treat empty string as NULL (i.e., skip it)
            $nameExtPart = ($nameExt === '') ? null : $nameExt;

            // Build array of parts, filter out null/empty, then join with spaces
            $parts = array_filter([
                $lastWithComma,
                $firstname,
                $middlePart,
                $nameExtPart,
            ], function ($value) {
                return $value !== null && $value !== '';
            });

            $fullname = trim(implode(' ', $parts));

            return $fullname;
        } else {
            return null;
        }
    }

    public function addLeadingZero($number, $length)
    {
        return str_pad($number, $length, '0', STR_PAD_LEFT);
    }

    public function formatSizeUnits($bytes)
    {
        if ($bytes >= 1073741824) {
            $bytes = number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            $bytes = number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            $bytes = number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            $bytes = $bytes . ' bytes';
        } elseif ($bytes == 1) {
            $bytes = $bytes . ' byte';
        } else {
            $bytes = '0 bytes';
        }

        return $bytes;
    }

    public function create_attachment($model, $file, $option)
    {
        if (!empty($option['folder_name'])) {
            $folder_name = !empty($option['folder_name']) ? $option['folder_name'] : null;
            $file_description = !empty($option['file_description']) ? $option['file_description'] : null;

            $fileName = $file->getClientOriginalName();
            $filePath = Str::random(10) . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs($folder_name, $filePath, 'public');
            $fileSize = $this->formatSizeUnits($file->getSize());
            $fileExtension = $file->getClientOriginalExtension();

            $file_type = "other";
            $images = ['jpg', 'png', 'gif', 'bmp', 'svg'];
            $documents = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'];
            $videos = ['mp4', 'flv', 'avi', 'mov', 'wmv'];
            $audios = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];

            if (in_array($fileExtension, $images)) {
                $file_type = "image";
            } elseif (in_array($fileExtension, $documents)) {
                $file_type = "document";
            } elseif (in_array($fileExtension, $videos)) {
                $file_type = "video";
            } elseif (in_array($fileExtension, $audios)) {
                $file_type = "audio";
            }

            $createAttach = $model->attachments()->create([
                'file_name' => $fileName,
                'file_description' => $file_description,
                'file_path' => "storage/" . $filePath,
                'file_size' => $fileSize,
                'file_ext' => $fileExtension,
                'file_type' => $file_type,
                "file_type_origin"  => $file->getClientMimeType(),
            ]);

            return $createAttach;
        } else {
            return false;
        }
    }

    // $this->pusher_notification([
    // "type" => "Notification",
    // "link_origin" => "http://localhost:4001",
    // "user_id" => 1,
    // ]);

    public function pusher_notification($message)
    {
        event(new NotificationPusherEvent($message));
    }

    // $this->send_notification([
    // "title" => "New Notification",
    // "description" => "New Notification",
    // "user_role_id" => 1,
    // "link" => "http://localhost:4001",
    // "link_id" => 1, // example: user_id
    // "system_id" => 1,
    // ]);

    public function send_notification($options)
    {
        $title = array_key_exists("title", $options) ? $options["title"] : "";

        if (array_key_exists("title", $options) && array_key_exists("system_id", $options)) {
            $title = $options["title"];
            $description = array_key_exists("description", $options) ? $options["description"] : "";
            $user_role_id = array_key_exists("user_role_id", $options) ? $options["user_role_id"] : "";
            $link = array_key_exists("link", $options) ? $options["link"] : "";
            $link_origin = array_key_exists("link_origin", $options) ? $options["link_origin"] : "";
            $link_id = array_key_exists("link_id", $options) ? $options["link_id"] : "";
            $system_id = array_key_exists("system_id", $options) ? $options["system_id"] : "";
            $userIds = array_key_exists("userIds", $options) ? $options["userIds"] : [];

            $dataNotifications = [
                "title" => $title,
                "description" => $description,
                "user_role_id" => $user_role_id,
                "link" => $link,
                "link_id" => $link_id,
                "system_id" => $system_id,
                "created_by" => Auth::id(),
            ];

            $queryNotification = Notification::create($dataNotifications);

            if ($queryNotification) {
                foreach ($userIds as $key => $value) {
                    NotificationUser::create([
                        "notification_id" => $queryNotification->id,
                        "user_id" => $value,
                    ]);

                    $this->pusher_notification([
                        "type" => "notification",
                        "link_origin" => $link_origin,
                        "user_id" => $value,
                    ]);
                }

                return [
                    "success" => true,
                    "message" => "Notification sent successfully."
                ];
            }
        } else {
            return [
                "success" => false,
                "message" => "title and system_id are required."
            ];
        }
    }

    public function send_email($options)
    {
        // local testing
        // php artisan queue:work

        $title = array_key_exists("title", $options) ? $options["title"] : "";
        $system_id = array_key_exists("system_id", $options) ? $options["system_id"] : "";

        $to_name = array_key_exists("to_name", $options) ? $options["to_name"] : "";
        $to_email = array_key_exists("to_email", $options) ? $options["to_email"] : "";


        $from_name = array_key_exists("from_name", $options) ? $options["from_name"] : "Father Saturnino Urios University";
        $sender_name = array_key_exists("sender_name", $options) ? $options["sender_name"] : "";
        $from_email = array_key_exists("from_email", $options) ? $options["from_email"] : "dsac@urios.edu.ph";
        $link = array_key_exists("link", $options) ? $options["link"] : "";
        $link_name = array_key_exists("link_name", $options) ? $options["link_name"] : "";
        $code = array_key_exists("code", $options) ? $options["code"] : "";

        $exam_schedule = array_key_exists("exam_schedule", $options) ? $options["exam_schedule"] : "";

        $fullname = array_key_exists("fullname", $options) ? $options["fullname"] : "";
        $account = array_key_exists("account", $options) ? $options["account"] : "";
        $password = array_key_exists("password", $options) ? $options["password"] : "";
        $monitored_by = array_key_exists("monitored_by", $options) ? $options["monitored_by"] : "";
        $date_monitored = array_key_exists("date_monitored", $options) ? $options["monitored_by"] : "";
        $time_monitored = array_key_exists("time_monitored", $options) ? $options["monitored_by"] : "";

        $template = array_key_exists("template", $options) ? $options["template"] : "emails.email-template";
        $position = array_key_exists("position", $options) ? $options["position"] : "position";

        $attachment = array_key_exists("attachment", $options) ? $options["attachment"] : [];

        $new_link = '<a href="' . $link . '" target="_blank"
        style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, "helvetica neue", helvetica, arial, sans-serif;font-size:18px;color:#333333;border-style:solid;border-color:#FEC300;border-width:10px 20px;display:inline-block;background:#FEC300;border-radius:4px;font-weight:bold;font-style:normal;line-height:22px;width:auto;text-align:center;">' . $link_name . '</a>';

        if ($title && $system_id) {
            $email_template = EmailTemplate::where("title", $title)->where("system_id", $system_id)->first();
            if ($email_template) {
                $subject = $email_template->subject;
                $body = $email_template->body;

                if ($subject) {
                    $subject = str_replace('[user:fullname]', $fullname, $subject); //sample
                }

                if ($body) {

                    if ($to_name) {
                        $body = str_replace('[user:to_name]', $to_name, $body);
                        $body = str_replace('[user:applicant_name]', $to_name, $body);
                    }



                    if ($new_link) {
                        $body = str_replace('[site:set-password-url]', $new_link, $body);
                    }

                    if ($sender_name) {
                        $body = str_replace('[user:sender_name]', $sender_name, $body);
                        $body = str_replace('[user:from_name]', $from_name, $body);
                    }

                    if ($position) {
                        $body = str_replace('[user:position]', $position, $body);
                    }

                    if ($exam_schedule) {
                        $body = str_replace('[user:exam_schedule]', $exam_schedule, $body);
                    }

                    if ($account) {
                        $body = str_replace('[user:account]', $account, $body);
                    }

                    if ($password) {
                        $body = str_replace('[user:password]', $password, $body);
                    }

                    if ($monitored_by) {
                        $body = str_replace('[user:monitored_by]', $monitored_by, $body);
                    }

                    if ($date_monitored) {
                        $body = str_replace('[user:date_monitored]', $date_monitored, $body);
                    }

                    if ($time_monitored) {
                        $body = str_replace('[user:time_monitored]', $time_monitored, $body);
                    }
                }

                // footer signature
                $data_email = [
                    'to_name'       => $to_name,
                    'to_email'      => $to_email,
                    'subject'       => $subject,
                    'from_name'     => $from_name,
                    'from_email'    => $from_email,
                    'template'      => $template,
                    'body_data'     => [
                        "content" => $body,
                    ]
                ];

                if (count($attachment) > 0) {
                    $data_email["attachment"] = $attachment;
                }

                return event(new \App\Events\SendEmailEvent($data_email));
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public function custom_send_email($options)
    {
        $to_name = array_key_exists("to_name", $options) ? $options["to_name"] : "";
        $to_email = array_key_exists("to_email", $options) ? $options["to_email"] : "";
        $subject = array_key_exists("subject", $options) ? $options["subject"] : "";
        $from_name = array_key_exists("from_name", $options) ? $options["from_name"] : "Father Saturnino Urios University";
        $from_email = array_key_exists("from_email", $options) ? $options["from_email"] : "support@fsuudsac.com";
        $email_body = array_key_exists("email_body", $options) ? $options["email_body"] : "";
        $template = array_key_exists("template", $options) ? $options["template"] : "emails.email-template";
        $attachment = array_key_exists("attachment", $options) ? $options["attachment"] : [];

        $error = false;

        if (!$to_name) {
            $error = true;
        }

        if (!$to_email) {
            $error = true;
        }

        if (!$subject) {
            $error = true;
        }

        if (!$from_name) {
            $error = true;
        }

        if (!$error) {

            // footer signature
            $data_email = [
                'to_name'       => $to_name,
                'to_email'      => $to_email,
                'subject'       => $subject,
                'from_name'     => $from_name,
                'from_email'    => $from_email,
                'template'      => $template,
                'body_data'     => [
                    "content" => $email_body,
                ]
            ];

            if (count($attachment) > 0) {
                $data_email["attachment"] = $attachment;
            }

            return event(new \App\Events\SendEmailEvent($data_email));
        }
    }

    public function update_create_inventory($options, $from)
    {
        $data = [
            'warehouse_id' => $options['warehouse_id'],
            "product_detail_id" => $options['product_detail_id'],
            "amount" => $options['amount'],
            "quantity" => $options['quantity'],
            'type' => $options['type'],
            'date_inventory' => $options['date_inventory'],
            'created_by' => Auth::id(),
        ];

        $updateFrom = [];

        if ($from == "Purchase Order") {
            $updateFrom = [
                "purchase_detail_id" => $options['purchase_detail_id'],
            ];
        } else if ($from == 'Release Item') {
            $updateFrom = [
                "sales_order_detail_id" => $options['sales_detail_id'],
            ];
        }

        Inventory::updateOrCreate($updateFrom, $data);
    }

    public function user_persmissions($user_id, $user_role_id)
    {
        if ($user_id != "" && $user_role_id != "") {
            $dataUserRolePermission = \App\Models\UserRolePermission::where('user_role_id', $user_role_id)
                ->get();

            foreach ($dataUserRolePermission as $key => $value) {
                $dataUserPermission = \App\Models\UserPermission::where('user_id', $user_id)
                    ->where('mod_button_id', $value->mod_button_id)
                    ->first();

                if ($dataUserPermission) {
                    $dataUserPermission->fill([
                        'status' => $value->status,
                        'updated_by' => Auth::id()
                    ])->save();
                } else {
                    \App\Models\UserPermission::create([
                        "user_id" => $user_id,
                        "mod_button_id" => $value->mod_button_id,
                        'status' => $value->status,
                        'created_by' => Auth::id()
                    ]);
                }
            }
        }
    }

    public function find_profile_by_user_id($user_id)
    {
        return \App\Models\Profile::with(['profile_departments'])->where('user_id', $user_id)->first();
    }

    // ussage
    // if ($this->check_password($request->password)) {

    // } else {
    //     $ret = [
    //         "success" => false,
    //         "message" => "Password is in correct",
    //     ];
    // }
    public function check_password($password)
    {
        $checkPassword = Hash::check($password, Auth::user()->password);

        return $checkPassword;
    }

    public function schoolYearActive()
    {
        $schoolYearActive = \App\Models\RefSchoolYear::where('status', 1)->first();

        return $schoolYearActive;
    }

    public function monthsInQuarter($quarter)
    {
        $months = [];

        switch ($quarter) {
            case 1:
                $months = ["January", "February", "March"];
                break;
            case 2:
                $months = ["April", "May", "June"];
                break;
            case 3:
                $months = ["July", "August", "September"];
                break;
            case 4:
                $months = ["October", "November", "December"];
                break;
            default:
                $months = [];
                break;
        }

        return $months;
    }

    public function getTotalPayment($id, $type)
    {
        $totalPayment = new UserPayment();

        if ($id) {
            if ($type && ($type == 'Purchase Order' || $type == 'Purchase Order Return')) {
                $totalPayment = $totalPayment->where('purchase_id', $id)->where('type', $type);
            } else if ($type && ($type == 'Release Item' || $type == 'Release Item Return')) {
                $totalPayment = $totalPayment->where('sales_id', $id)->where('type', $type);
            } else {
                if ($type && $type == 'User Purchased') {
                    $totalPayment = $totalPayment->where('user_id', $id)->where('type', 'Purchased');
                }
            }
        }

        return $totalPayment->sum('amount');
    }

    public function pdf_template($options)
    {
        $title = $options['title'];
        $data = $options['data'];
        $template = $options['template'];
        $paper_size = array_key_exists("paper_size", $options) ? $options["paper_size"] : "A4";
        $orientation = array_key_exists("orientation", $options) ? $options["orientation"] : "portrait";

        $pdf = Pdf::loadView($template, ["data" => $data]);
        $pdf->getDomPDF()->setHttpContext(
            stream_context_create([
                'ssl' => [
                    'allow_self_signed' => TRUE,
                    'verify_peer' => FALSE,
                    'verify_peer_name' => FALSE,
                ]
            ])
        );
        $pdf->setPaper($paper_size, $orientation);

        return $pdf->stream($title . '.pdf');
    }

    public function getMainWarehouse()
    {
        return Warehouse::firstWhere('status', 1);
    }

    public function createUserPermission($user_id, $role)
    {
        $dataUserRolePermission = UserRolePermission::where("user_role_id", $role)->get();

        foreach ($dataUserRolePermission as $d) {
            UserPermission::updateOrCreate([
                "user_id" => $user_id,
                "mod_button_id" => $d->mod_button_id,
            ], [
                "user_id" => $user_id,
                "mod_button_id" => $d->mod_button_id,
                "status" => $d->status,
            ]);
        }
    }

    public function historical_data($data)
    {
        $ret = false;
        try {
            DB::transaction(function () use ($data, &$ret) {
                $now = now();
                $processedData = array_map(function ($record) use ($now) {
                    if (!isset($record['created_at'])) {
                        $record['created_at'] = $now;
                    }
                    if (!isset($record['updated_at'])) {
                        $record['updated_at'] = $now;
                    }

                    $record['ip_address'] = $this->getIP();
                    $record['browser'] = $this->getBrowser();
                    $record['created_by'] = Auth::user() ? Auth::id() : null;

                    return $record;
                }, $data);

                HistoricalData::insert($processedData);

                $ret = true;
            });
        } catch (\Throwable $th) {
            //throw $th;
            $fullname = "System";

            if (Auth::user()) {
                $fullname = Auth::user()->firstname . ' ' . Auth::user()->lastname;
            }

            // Log::error("[" . now() . "] " . "Error in historical_data function by " . $fullname . ": " . $th->getMessage());
            $ret = false;
        }
        return $ret;
    }

    public function historical_data_bulk($options)
    {
        $model = $options['model']; // e.g. App\Models\Profile
        $originalValue = $options['originalValue']; // e.g. original model instance before changes
        $changes = $options['changes']; // e.g. changed data
        $original = $options['original']; // e.g. original data before changes
        $createUpdate = $options['createUpdate']; // e.g. the model instance that was created or updated
        $subject = $options['subject']; // e.g. subject of the historical data
        $description = array_key_exists('description', $options) ? $options['description'] : ""; // e.g. description of the historical data
        $action = array_key_exists('action', $options) ? $options['action'] : "Update"; // e.g. action type
        $module = array_key_exists('module', $options) ? $options['module'] : "System"; // e.g. module name
        $status = array_key_exists('status', $options) ? $options['status'] : "Success"; // e.g. status
        $from = array_key_exists('from', $options) ? $options['from'] : ""; // e.g.

        $fullname = Auth::user()->profile->firstname . " " . Auth::user()->profile->lastname;
        $data_historical = [];

        foreach ($changes as $key => $value) {
            if (array_key_exists($key, $original)) {
                if (!in_array($key, ['updated_at', 'created_at', 'created_by', 'updated_by'])) {

                    if (empty($description)) {
                        $description = $subject . ' updated by ' . $fullname;
                    }

                    // $originalValue is null on create (no existing record), so guard against it
                    $old_value = $originalValue ? $originalValue[$key] : null;
                    $new_value = $value;

                    $data_historical[] = [
                        "historicalable_type" => $model,
                        "historicalable_id" => $createUpdate->id,
                        "subject" => $subject,
                        "description" => $description,
                        "field_name" => $key,
                        'old_value' => $old_value,
                        'new_value' => $new_value,
                        'action' => $action,
                        'module' => $module,
                        'status' => $status,
                    ];
                }
            }
        }

        $this->historical_data($data_historical);
    }

    public function getBrowser()
    {
        $userAgent = request()->header('User-Agent', 'Unknown');

        $browsers = [
            '/Edg\//i'          => 'Microsoft Edge',
            '/OPR\//i'          => 'Opera',
            '/Chrome\//i'       => 'Google Chrome',
            '/Firefox\//i'      => 'Mozilla Firefox',
            '/Safari\//i'       => 'Safari',
            '/MSIE|Trident\//i' => 'Internet Explorer',
        ];

        $browser = 'Unknown';
        foreach ($browsers as $pattern => $name) {
            if (preg_match($pattern, $userAgent)) {
                $browser = $name;
                break;
            }
        }

        return "Browser: {$browser}, User Agent: {$userAgent}";
    }

    public function getIP()
    {
        // Get IP from various sources
        $ipSources = [
            request()->header('CF-Connecting-IP'), // Cloudflare
            request()->header('X-Forwarded-For'), // Proxy/Load Balancer
            request()->header('X-Real-IP'), // Nginx proxy
            request()->getClientIp() // Laravel default
        ];

        $foundIpv6 = null; // Store IPv6 as fallback

        foreach ($ipSources as $ip) {
            if (!$ip) continue;

            // Handle comma-separated IPs (from proxies)
            if (strpos($ip, ',') !== false) {
                $ips = explode(',', $ip);
                foreach ($ips as $singleIp) {
                    $singleIp = trim($singleIp);

                    // Check if it's a valid IPv4 address first
                    if (filter_var($singleIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                        return $singleIp;
                    }

                    // Store IPv6 as fallback if we haven't found one yet
                    if (!$foundIpv6 && filter_var($singleIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
                        $foundIpv6 = $singleIp;
                    }
                }
            } else {
                $ip = trim($ip);

                // Check if it's a valid IPv4 address first
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }

                // Store IPv6 as fallback if we haven't found one yet
                if (!$foundIpv6 && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
                    $foundIpv6 = $ip;
                }
            }
        }

        // If no valid public IPv4 found, check for private IPv4 addresses
        foreach ($ipSources as $ip) {
            if (!$ip) continue;

            if (strpos($ip, ',') !== false) {
                $ips = explode(',', $ip);
                foreach ($ips as $singleIp) {
                    $singleIp = trim($singleIp);

                    // Check for any valid IPv4 (including private)
                    if (filter_var($singleIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                        return $singleIp;
                    }
                }
            } else {
                $ip = trim($ip);

                // Check for any valid IPv4 (including private)
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                    return $ip;
                }
            }
        }

        // If still no IPv4 found, try to extract IPv4 from IPv6 (if it's IPv4-mapped)
        foreach ($ipSources as $ip) {
            if (!$ip) continue;

            $ip = trim($ip);

            // Check if it's an IPv4-mapped IPv6 address (::ffff:192.168.1.1)
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
                if (substr($ip, 0, 7) === '::ffff:') {
                    $ipv4 = substr($ip, 7);
                    if (filter_var($ipv4, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                        return $ipv4;
                    }
                }
            }
        }

        // If no IPv4 found at all, return the IPv6 we found earlier
        if ($foundIpv6) {
            return $foundIpv6;
        }

        // Last resort: return localhost
        return '127.0.0.1';
    }
}
