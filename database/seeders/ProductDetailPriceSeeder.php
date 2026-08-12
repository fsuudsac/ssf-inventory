<?php

namespace Database\Seeders;

use App\Models\ProductDetailPrice;
use Illuminate\Database\Seeder;

class ProductDetailPriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProductDetailPrice::truncate();

        $data = [
            [
                'product_id'        => 1,
                'product_detail_id' => 1,
                'cost'              => '500.00',
                'dealers_price'     => '600.00',
                'wholesale_price'   => '650.00',
                'srp'               => '750.00',
                'fleet_price'       => '700.00',
                'start_date'        => '2026-01-01',
                'end_date'          => '2026-06-30',
                'created_by'        => 1,
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'product_id'        => 1,
                'product_detail_id' => 1,
                'cost'              => '520.00',
                'dealers_price'     => '620.00',
                'wholesale_price'   => '670.00',
                'srp'               => '780.00',
                'fleet_price'       => '720.00',
                'start_date'        => '2026-07-01',
                'end_date'          => '2026-12-31',
                'created_by'        => 1,
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'product_id'        => 2,
                'product_detail_id' => 2,
                'cost'              => '1200.00',
                'dealers_price'     => '1400.00',
                'wholesale_price'   => '1500.00',
                'srp'               => '1800.00',
                'fleet_price'       => '1650.00',
                'start_date'        => '2026-01-01',
                'end_date'          => '2026-12-31',
                'created_by'        => 1,
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ];

        ProductDetailPrice::insert($data);
    }
}
