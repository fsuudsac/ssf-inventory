<!-- filepath: /d:/FILES/motolite_inventory/resources/views/pdf/report-ledger-customer-report-template.blade.php -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REPORT-CUSTOMER-LEDGER {{ date('Ymd-his') }}</title>

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

        .w-10px {
            width: 10px;
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
            border-bottom: 1px solid #000;
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

        .tbl-header-wrapper {
            position: relative;
            width: 100%;
        }

        .tbl-header-wrapper table {
            position: absolute;
        }

        .tbl-header-wrapper table:first-child {
            left: 0;
        }

        .tbl-header-wrapper table:last-child {
            right: 0;
        }

        .tbl-customer-info {
            width: 40%;
        }

        .tbl-customer-info tr>td:first-child {
            width: 40%;
        }

        .tbl-customer-info tr>td:last-child {
            width: 60%;
            border-bottom: 1px solid #000;
        }


        .tbl-sales_order-info {
            width: 40%;
            right: 0;
        }

        .tbl-sales_order-info tr>td:first-child {
            width: 40%;
        }

        .tbl-sales_order-info tr>td:last-child {
            width: 60%;
            border-bottom: 1px solid #000;
        }

        .sales_order-details-wrapper {
            margin-top: 130px;
        }

        .tbl-sales_order-details {}

        .tbl-sales_order-details thead th {
            border: 1px solid #000;
            padding: 5px;
            background-color: #e7e7e9;
            font-weight: bold;
        }

        .tbl-sales_order-details tbody td {
            border: 1px solid #000;
            padding: 5px;
        }

        .tbl-sales_order-details tfoot td {
            border: 1px solid #000;
            padding: 5px;
        }

        .tbl-sales_order-details tfoot td:first-child {
            background-color: #e7e7e9;
            font-weight: bold;
        }

        .tbl-total-info-wrapper {
            margin-top: 30px;
            position: relative;
        }

        .tbl-total-info {
            position: absolute;
            right: 0;
            width: 45%;
        }

        .tbl-total-info tr>td:first-child {
            width: 60%;
        }

        .tbl-total-info tr>td:last-child {
            width: 40%;
            text-align: right;
            padding-right: 5px;
        }

        .page-break {
            page-break-after: always;
        }
    </style>

</head>

<body>
    <div class="company_name">{{ env('APP_NAME') }}</div>
    <div class="company_address">{!! env('APP_COMPANY_ADDRESS') !!}</div>

    <div class="pdf_name">Customer Ledger</div>

    @foreach ($data as $sales_order)
        <div class="tbl-header-wrapper">
            <table class="tbl-customer-info">
                <tr>
                    <td>Customer Name:</td>
                    <td>{{ $sales_order->user->profile->firstname }} {{ $sales_order->user->profile->lastname }}
                    </td>
                </tr>
                <tr>
                    <td>Address:</td>
                    <td>
                        @if ($sales_order->profile_address)
                            {{ $sales_order->profile_address->address }}
                        @endif
                    </td>
                </tr>
                <tr>
                    <td>TIN:</td>
                    <td>
                        @if ($sales_order->user)
                            {{ $sales_order->user->profile->taxpayer_identification }}
                        @endif
                    </td>
                </tr>
                <tr>
                    <td>Terms:</td>
                    <td>Cash</td>
                </tr>
            </table>

            <table class="tbl-sales_order-info">
                <tr>
                    <td>Date of Transaction:</td>
                    <td>{{ $sales_order->date_sold ? date('F d, Y', strtotime($sales_order->date_sold)) : '' }}
                    </td>
                </tr>
                <tr>
                    <td>Date Due:</td>
                    <td>{{ $sales_order->date_due ? date('F d, Y', strtotime($sales_order->date_due)) : '' }}</td>
                </tr>
                <tr>
                    <td>Vat Type:</td>
                    <td>{{ $sales_order->vat_type }}</td>
                </tr>
                <tr>
                    <td>EWT Type:</td>
                    <td>
                        @if ($sales_order->ewt_type)
                            {{ $sales_order->ewt_type->ewt_type }}%
                        @endif
                    </td>
                </tr>
                <tr>
                    <td>Invoice No.:</td>
                    <td>
                        @if ($sales_order->invoice_no)
                            {{ $sales_order->invoice_no }}
                        @endif
                    </td>
                </tr>
            </table>
            <br>

        </div>

        <div class="sales_order-details-wrapper">
            <table class="tbl-sales_order-details">
                <thead>
                    <tr>
                        <th>
                            Product
                        </th>
                        <th>
                            Type
                        </th>
                        <th>
                            Size
                        </th>
                        <th class="text-right">
                            Quantity
                        </th>
                        <th class="text-right">
                            Cost per Unit
                        </th>
                        <th class="text-right">
                            Total Cost
                        </th>
                        <th class="text-right">
                            VAT
                        </th>
                        <th class="text-right">
                            Gross Amount
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($sales_order['sales_order_details'] as $sales_order_detail)
                        <tr>
                            <td class="text-center">
                                {{ $sales_order_detail['product_detail']['product']['product_name'] }}
                            </td>
                            <td class="text-center">
                                @if ($sales_order_detail['product_detail']['product_type'])
                                    {{ $sales_order_detail['product_detail']['product_type']['product_type'] }}
                                @endif
                            </td>
                            <td class="text-center">
                                @if ($sales_order_detail['product_detail']['product_size'])
                                    {{ $sales_order_detail['product_detail']['product_size']['product_size'] }}
                                @endif
                            </td>
                            <td class="text-right">
                                {{ $sales_order_detail['quantity'] }}
                            </td>
                            <td class="text-right">
                                <span class="DejaVuSans">₱</span>
                                {{ number_format($sales_order_detail['cost_per_unit'], 2) }}
                            </td>
                            <td class="text-right">
                                <span class="DejaVuSans">₱</span>
                                {{ number_format($sales_order_detail['total_cost'], 2) }}
                            </td>
                            <td class="text-right">
                                <span class="DejaVuSans">₱</span> {{ number_format($sales_order_detail['vat'], 2) }}
                            </td>
                            <td class="text-right">
                                <span class="DejaVuSans">₱</span>
                                {{ number_format($sales_order_detail['gross_amount'], 2) }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" class="text-right">
                            Total
                        </td>
                        <td class="text-right font-weight-bold">
                            <span class="DejaVuSans">₱</span>
                            {{ number_format($sales_order->total_amount_payable, 2) }}
                        </td>
                        <td class="text-right font-weight-bold">
                            <span class="DejaVuSans">₱</span> {{ number_format($sales_order->value_added_tax, 2) }}
                        </td>
                        <td class="text-right font-weight-bold">
                            <span class="DejaVuSans">₱</span>
                            {{ number_format($sales_order->total_gross_amount, 2) }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="tbl-total-info-wrapper">
            <table class="tbl-total-info">
                <tr>
                    <td>
                        Total Gross Amount
                    </td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td>
                        {{ number_format($sales_order->total_gross_amount, 2) }}
                    </td>
                </tr>
                <tr>
                    <td>
                        Add: Value-Added Tax
                    </td>
                    <td class="w-10px border-bottom"><span class="DejaVuSans">₱</span></td>
                    <td class="border-bottom">
                        {{ number_format($sales_order->value_added_tax, 2) }}
                    </td>
                </tr>
                <tr>
                    <td class="font-weight-bold">
                        Total Amount Payable
                    </td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td class="font-weight-bold">
                        {{ number_format($sales_order->total_amount_payable, 2) }}
                    </td>
                </tr>
                <tr>
                    <td>
                        Less: Withholding Tax
                    </td>
                    <td class="w-10px border-bottom"><span class="DejaVuSans">₱</span></td>
                    <td class="border-bottom">
                        {{ number_format($sales_order->withholding_tax, 2) }}
                    </td>
                </tr>
                <tr>
                    <td class="font-weight-bold">
                        Amount Due
                    </td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td class="font-weight-bold">
                        {{ number_format($sales_order->amount_due, 2) }}
                    </td>
                </tr>
                <tr>
                    <td>
                        Less: Discount
                    </td>
                    <td class="w-10px border-bottom"><span class="DejaVuSans">₱</span></td>
                    <td class="border-bottom">
                        {{ number_format($sales_order->discount, 2) }}
                    </td>
                </tr>
                <tr>
                    <td class="font-weight-bold">
                        Net Amount Due
                    </td>
                    <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                    <td class="font-weight-bold">
                        {{ number_format($sales_order->total_amount_payable, 2) }}
                    </td>
                </tr>
            </table>
        </div>

        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>

</html>
