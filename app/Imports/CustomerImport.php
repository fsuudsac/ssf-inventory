<?php

namespace App\Imports;

use App\Models\BillToCompany;
use App\Models\Company;
use App\Models\Profile;
use App\Models\ProfileAddress;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class CustomerImport implements ToCollection
{
    private $ret = [];

    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection)
    {
        $this->ret = [
            "success" => false,
            "message" => "Excel Data Not Uploaded",
        ];

        $header = ["", "", "", "", ""]; // 24
        $data = [];

        foreach ($collection as $key => $value) {
            $row = [];
            for ($i = 2; $i <= 25; $i++) {
                $row[] = isset($value[$i]) ? $value[$i] : null;
            }

            if ($key == 0) {
                $header = array_map(function ($col) {
                    return strtoupper(str_replace(' ', '', $col));
                }, $row);
            } else {
                $row = array_map(function ($col) {
                    return mb_convert_encoding(trim($col), 'UTF-8', 'auto');
                }, $row);
                $data[] = $row;
            }
        }

        $ifHeader = [
            "CODE",
            "CUSTOMER",
            "OUTSTANDINGBALANCE",
            "COMPANY",
            "MR./MS.",
            "FIRSTNAME",
            "M.I.",
            "LASTNAME",
            "PRIMARYCONTACT",
            "MAINEMAIL",
            "BILLTO1",
            "BILLTO2",
            "BILLTO3",
            "BILLTO4",
            "BILLTO5",
            "SHIPTO1",
            "SHIPTO2",
            "SHIPTO3",
            "SHIPTO4",
            "SHIPTO5",
            "CUSTOMERTYPE",
            "TERMS",
            "REPRE",
            "SALESTAXCODE"
        ];

        if ($header === $ifHeader && count($data) > 0) {
            foreach ($data as $value) {
                list(
                    $CODE,
                    $CUSTOMER,
                    $OUTSTANDINGBALANCE,
                    $COMPANY,
                    $MRMRS,
                    $FIRSTNAME,
                    $MI,
                    $LASTNAME,
                    $PRIMARYCONTACT,
                    $MAINEMAIL,
                    $BILLTO1,
                    $BILLTO2,
                    $BILLTO3,
                    $BILLTO4,
                    $BILLTO5,
                    $SHIPTO1,
                    $SHIPTO2,
                    $SHIPTO3,
                    $SHIPTO4,
                    $SHIPTO5,
                    $CUSTOMERTYPE,
                    $TERMS,
                    $REPRE,
                    $SALESTAXCODE
                ) = $value;

                if (empty($COMPANY)) {
                    $COMPANY = $CUSTOMER;
                }

                $createCompany = Company::firstOrCreate(['company' => $COMPANY]);

                $email = !empty($MAINEMAIL) ? $MAINEMAIL : strtolower(str_replace(' ', '', trim($CUSTOMER))) . "@gmail.com";

                $existingUser = User::firstOrCreate(['email' => $email], [
                    "username" => $CUSTOMER,
                    "role" => "Customer",
                ]);

                if ($existingUser->wasRecentlyCreated) {
                    $createProfile = Profile::create([
                        "user_id" => $existingUser->id,
                        "firstname" => $CUSTOMER,
                        "company_id" => $createCompany->id,
                        "salutation" => $MRMRS,
                        "contact_no" => $PRIMARYCONTACT,
                    ]);
                } else {
                    $createProfile = $existingUser->profile;
                    $createProfile->update([
                        "firstname" => $CUSTOMER,
                        "company_id" => $createCompany->id,
                        "salutation" => $MRMRS,
                        "contact_no" => $PRIMARYCONTACT,
                    ]);
                }

                $this->handleAddress($createCompany, $BILLTO1, 'Bill', $createProfile);
                $this->handleAddress($createCompany, $BILLTO2, 'Bill', $createProfile);
                $this->handleAddress($createCompany, $BILLTO3, 'Bill', $createProfile);
                $this->handleAddress($createCompany, $BILLTO4, 'Bill', $createProfile);
                $this->handleAddress($createCompany, $BILLTO5, 'Bill', $createProfile);

                $this->handleAddress($createCompany, $SHIPTO1, 'Ship', $createProfile);
                $this->handleAddress($createCompany, $SHIPTO2, 'Ship', $createProfile);
                $this->handleAddress($createCompany, $SHIPTO3, 'Ship', $createProfile);
                $this->handleAddress($createCompany, $SHIPTO4, 'Ship', $createProfile);
                $this->handleAddress($createCompany, $SHIPTO5, 'Ship', $createProfile);
            }

            $this->ret = [
                "success" => true,
                "message" => "Excel Data Uploaded Successfully",
            ];
        } else {
            $this->ret = [
                "success" => false,
                "message" => "File format is not correct. Please download the correct format and try again.",
            ];
        }
    }

    private function handleAddress($createCompany, $address, $type, $createProfile)
    {
        if ($address) {
            $findAddress = ProfileAddress::firstOrCreate([
                'profile_id' => $createProfile->id,
                'address' => $address,
                'type' => $type,
            ], [
                "status" => 1,
            ]);

            if (!$findAddress->wasRecentlyCreated) {
                $findAddress->update([
                    "address" => $address,
                    "type" => $type,
                    "status" => 1,
                ]);
            }
        }
    }

    public function getMessage()
    {
        return $this->ret;
    }
}
