<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class BrandImport implements ToCollection
{
    private $data;
    private $exam_category_id;

    public function __construct(array $data, int $exam_category_id)
    {
        $this->data = $data;
        $this->exam_category_id = $exam_category_id;
    }

    private $ret = [];

    /**
     * @param Collection $collection
     */
    public function collection(Collection $collection)
    {
        $header = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
        $data = [];
    }

    public function getMessage()
    {
        return $this->ret;
    }
}