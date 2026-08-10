<?php

namespace App\Imports;

use App\Models\BillToCompany;
use App\Models\Company;
use App\Models\Profile;
use App\Models\ProfileAddress;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class SupplierImport implements ToCollection
{
    private $ret = [];

    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection)
    {

        $ret = [
            "success" => false,
            "message" => "Excel Data Not Uploaded",
        ];

        $header = ["", "", "", "", "", "", "", "", "", "", "", "", ""]; // 13
        $data = [];

        foreach ($collection as $key => $value) {
            $col2 = isset($value[2]) ? $value[2] : null;
            $col3 = isset($value[3]) ? $value[3] : null;
            $col4 = isset($value[4]) ? $value[4] : null;
            $col5 = isset($value[5]) ? $value[5] : null;
            $col6 = isset($value[6]) ? $value[6] : null;
            $col7 = isset($value[7]) ? $value[7] : null;
            $col8 = isset($value[8]) ? $value[8] : null;
            $col9 = isset($value[9]) ? $value[9] : null;
            $col10 = isset($value[10]) ? $value[10] : null;
            $col11 = isset($value[11]) ? $value[11] : null;
            $col12 = isset($value[12]) ? $value[12] : null;
            $col13 = isset($value[13]) ? $value[13] : null;
            $col14 = isset($value[14]) ? $value[14] : null;

            if ($key == 0) {
                $col2 = strtoupper(str_replace(' ', '', $col2));
                $col3 = strtoupper(str_replace(' ', '', $col3));
                $col4 = strtoupper(str_replace(' ', '', $col4));
                $col5 = strtoupper(str_replace(' ', '', $col5));
                $col6 = strtoupper(str_replace(' ', '', $col6));
                $col7 = strtoupper(str_replace(' ', '', $col7));
                $col8 = strtoupper(str_replace(' ', '', $col8));
                $col9 = strtoupper(str_replace(' ', '', $col9));
                $col10 = strtoupper(str_replace(' ', '', $col10));
                $col11 = strtoupper(str_replace(' ', '', $col11));
                $col12 = strtoupper(str_replace(' ', '', $col12));
                $col13 = strtoupper(str_replace(' ', '', $col13));
                $col14 = strtoupper(str_replace(' ', '', $col14));

                $header = [
                    $col2,
                    $col3,
                    $col4,
                    $col5,
                    $col6,
                    $col7,
                    $col8,
                    $col9,
                    $col10,
                    $col11,
                    $col12,
                    $col13,
                    $col14
                ];
            } else {
                $col2 = isset($value[2]) ? trim($value[2]) : null;
                $col2 = mb_convert_encoding($col2, 'UTF-8', 'auto');

                $col3 = isset($value[3]) ? trim($value[3]) : null;
                $col3 = mb_convert_encoding($col3, 'UTF-8', 'auto');

                $col4 = isset($value[4]) ? trim($value[4]) : null;
                $col4 = mb_convert_encoding($col4, 'UTF-8', 'auto');

                $col5 = isset($value[5]) ? trim($value[5]) : null;
                $col5 = mb_convert_encoding($col5, 'UTF-8', 'auto');

                $col6 = isset($value[6]) ? trim($value[6]) : null;
                $col6 = mb_convert_encoding($col6, 'UTF-8', 'auto');

                $col7 = isset($value[7]) ? trim($value[7]) : null;
                $col7 = mb_convert_encoding($col7, 'UTF-8', 'auto');

                $col8 = isset($value[8]) ? trim($value[8]) : null;
                $col8 = mb_convert_encoding($col8, 'UTF-8', 'auto');

                $col9 = isset($value[9]) ? trim($value[9]) : null;
                $col9 = mb_convert_encoding($col9, 'UTF-8', 'auto');

                $col10 = isset($value[10]) ? trim($value[10]) : null;
                $col10 = mb_convert_encoding($col10, 'UTF-8', 'auto');

                $col11 = isset($value[11]) ? trim($value[11]) : null;
                $col11 = mb_convert_encoding($col11, 'UTF-8', 'auto');

                $col12 = isset($value[12]) ? trim($value[12]) : null;
                $col12 = mb_convert_encoding($col12, 'UTF-8', 'auto');

                $col13 = isset($value[13]) ? trim($value[13]) : null;
                $col13 = mb_convert_encoding($col13, 'UTF-8', 'auto');

                $col14 = isset($value[14]) ? trim($value[14]) : null;
                $col14 = mb_convert_encoding($col14, 'UTF-8', 'auto');

                $data[] = [
                    $col2,
                    $col3,
                    $col4,
                    $col5,
                    $col6,
                    $col7,
                    $col8,
                    $col9,
                    $col10,
                    $col11,
                    $col12,
                    $col13,
                    $col14
                ];
            }
        }

        $ifheader = $header[0] == "SUPPLIER" && $header[1] == "OUTSTANDINGBALANCE" && $header[2] == "COMPANY" && $header[3] == "TIN" && $header[4] == "MR./MRS./MS." && $header[5] == "CONTACTPERSONFIRSTNAME" && $header[6] == "M.I." && $header[7] == "LASTNAME" && $header[8] == "CONTACTNO." && $header[9] == "BILLTOCOMPANY" && $header[10] == "ADDRESS1" && $header[11] == "ADDRESS2" && $header[12] == "ADDRESS3";

        if ($ifheader && count($data) > 0) {
            foreach ($data as $key => $value) {
                $SUPPLIER = $value[0];
                $OUTSTANDINGBALANCE = $value[1];
                $COMPANY = $value[2];
                $TIN = $value[3];
                $MRMRSMS = $value[4];
                $CONTACTPERSONFIRSTNAME = $value[5];
                $MI = $value[6];
                $LASTNAME = $value[7];
                $CONTACTNO = $value[8];
                $BILLTOCOMPANY = $value[9];
                $ADDRESS1 = $value[10];
                $ADDRESS2 = $value[11];
                $ADDRESS3 = $value[12];

                $findCompany = Company::firstOrCreate(['company' => $SUPPLIER]);

                $findSupplier = Profile::where('firstname', $SUPPLIER)->first();
                if (!$findSupplier) {
                    // create new 
                    $userCreate = User::create([
                        "username" => $SUPPLIER,
                        "email" => strtolower(preg_replace('/[.\-\/,&\s]/', '', $SUPPLIER)) . "@gmail.com",
                        "role" => "Supplier",
                    ]);

                    if ($userCreate) {
                        $findSupplier = Profile::create([
                            "user_id" => $userCreate->id,
                            "firstname" => $SUPPLIER,
                            "company_id" => $findCompany->id,
                            "taxpayer_identification" => $TIN,
                            "salutation" => $MRMRSMS,
                            "contact_no" => $CONTACTNO,
                        ]);
                    }
                } else {
                    $findSupplier->update([
                        "firstname" => $SUPPLIER,
                        "company_id" => $findCompany->id,
                        "taxpayer_identification" => $TIN,
                        "salutation" => $MRMRSMS,
                        "contact_no" => $CONTACTNO,
                    ]);
                }

                $addresses = [$ADDRESS1, $ADDRESS2, $ADDRESS3];

                foreach ($addresses as $address) {
                    if ($address) {
                        $findProfileAddress = ProfileAddress::firstOrNew([
                            'profile_id' => $findSupplier->id,
                            'address' => $address,
                            'type' => 'Bill'
                        ]);

                        $findProfileAddress->status = 1;
                        $findProfileAddress->save();
                    } else {
                        ProfileAddress::where('profile_id', $findSupplier->id)
                            ->where('address', $address)
                            ->where('type', 'Bill')
                            ->update(['status' => 0]);
                    }
                }
            }

            $this->ret = [
                "success" => true,
                "message" => "Excel Data Uploaded",
                "header" => $header,
                "data" => $data
            ];
        } else {
            $this->ret = [
                "success" => false,
                "message" => "File format is not correct. Please download the correct format and try again.",
            ];
        }
        return response()->json($ret, 200);
    }

    public function getMessage()
    {
        return $this->ret;
    }
}
