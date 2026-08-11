<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REPORT-LEDGER-INVENTORY {{ date('Ymd-his') }}</title>

    <style>
        @page {
            margin: .3in;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            position: relative;
            margin: 0;
            padding: 0;
        }

        .DejaVuSans {
            font-family: 'DejaVu Sans', sans-serif;
        }

        .color-white {
            color: #fff;
        }

        .header-color {
            background: #0026A0a1;
        }

        .title-color {
            background: #7990a846;
        }

        .sub-color {
            background: #2f6dab74;
        }

        .cell-color {
            background: #0157DE4a;
        }

        .p-5px {
            padding: 5px;
        }

        .p-10px {
            padding: 10px;
        }

        .m-20px {
            margin: 20px;
        }

        .w-10px {
            width: 10px;
        }

        .w-100px {
            width: 100px;
        }

        .w-400px {
            width: 400px;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

        .font-weight-bold {
            font-weight: bold;
        }

        .border-bottom {
            border-bottom: 1px solid #000 !important;
        }

        .border {
            border: 1px solid #000;
        }

        table {
            width: 100%;
        }


        table,
        td,
        th {
            border-collapse: collapse;
        }

        .company_name {
            font-size: 20px;
            font-weight: bold;
            width: 100%;
            text-align: center;
        }

        .company_address {
            font-size: 12px;
            width: 100%;
            text-align: center;
        }

        .pdf_name {
            font-size: 16px;
            font-weight: bold;
            width: 100%;
            text-align: center;
            margin-top: 30px;
            margin-bottom: 30px;
        }

        .tbl-statement-wrapper {
            margin: 0 auto;
        }

        .tbl-statement-wrapper tr td {
            border-bottom: 1px solid #b2bac18d;
            padding: 5px;
        }

        .page-break {
            page-break-after: always;
        }

        .center-content {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>

<body>
    <div class="company_name">{{ env('APP_NAME') }}</div>
    <div class="company_address">{!! env('APP_COMPANY_ADDRESS') !!}</div>

    <div class="pdf_name">Statement of Profit or Loss</div>

    @php
    $revenue = $data['sales_orders']->sum(function ($order) {
    return $order->total_amount_payable ?? 0;
    });
    $discount = $data['sales_orders']->sum(function ($order) {
    return $order->discount_amount ?? 0;
    });
    $net_sales = $revenue - $discount;

    $cost_of_goods_sold = $data['sales_orders']->reduce(function ($acc, $order) {
    $total = 0;
    foreach ($order->sales_order_details as $detail) {
    $total += $detail->quantity * $detail->orig_cost;
    }
    return $acc + $total;
    }, 0);

    $gross_margin = $net_sales - $cost_of_goods_sold;
    @endphp



    <div class="tbl-statement-wrapper border text-center w-400px">
        <table>
            <thead class="text-center header-color color-white">
                <tr class="border-bottom ">
                    <td colspan="4" class="p-10px">
                        <strong class="text-center">
                            {{ $data['start_date'] ? \Carbon\Carbon::parse($data['start_date'])->format('F d, Y ') : 'N/A' }}
                            -
                            {{ $data['end_date'] ? \Carbon\Carbon::parse($data['end_date'])->format(' F d, Y') : 'N/A' }}
                        </strong>
                    </td>
                </tr>
            </thead>

            <tbody class="sub-color font-weight-bold ">
                <tr>
                    <td colspan="2">Particulars</td>
                    <td colspan="2">Amount <span class="DejaVuSans">( ₱ )</span></td>
                </tr>
            </tbody>

            <tfoot>
                <tr>
                    <td colspan="2">Revenue</td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td class="text-right ">{{ number_format($revenue, 2) }}</td>
                </tr>
                <tr>
                    <td colspan="2">Less Discount</td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td class="text-right ">{{ number_format($discount, 2) }}
                    </td>
                </tr>
                <tr class="title-color">
                    <td colspan="2" class="font-weight-bold">Net Sales</td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td class="font-weight-bold text-right ">{{ number_format($net_sales, 2) }}</td>
                </tr>
                <tr>
                    <td colspan="2">Cost of Goods Sold</td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td class="text-right ">{{ number_format($cost_of_goods_sold, 2) }}
                    </td>
                </tr>
                <tr class="title-color">
                    <td colspan="2" class=" font-weight-bold">GROSS MARGIN</td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td class="font-weight-bold text-right ">{{ number_format($gross_margin, 2) }}</td>
                </tr>
            </tfoot>
        </table>
    </div>
</body>

</html>