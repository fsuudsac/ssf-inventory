<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>SALES-{{ $data->invoice_no }}-{{ date('Ymd-his') }}</title>

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

        .tbl-supplier-info {
            width: 40%;
        }

        .tbl-supplier-info tr>td:first-child {
            width: 40%;
        }

        .tbl-supplier-info tr>td:last-child {
            width: 60%;
            border-bottom: 1px solid #000;
        }


        .tbl-purchase-info {
            width: 40%;
        }

        .tbl-purchase-info tr>td:first-child {
            width: 50%;
        }

        .tbl-purchase-info tr>td:last-child {
            width: 50%;
            border-bottom: 1px solid #000;
        }

        .purchase-details-wrapper {
            margin-top: 130px;
        }

        .tbl-purchase-details {}

        .tbl-purchase-details thead th {
            border: 1px solid #000;
            padding: 5px;
            background-color: #e7e7e9;
            font-weight: bold;
        }

        .tbl-purchase-details tbody td {
            border: 1px solid #000;
            padding: 5px;
        }

        .tbl-purchase-details tfoot td {
            border: 1px solid #000;
            padding: 5px;
        }

        .tbl-purchase-details tfoot td:first-child {
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
            width: 40%;
        }

        .tbl-total-info tr>td:first-child {
            width: 60%;
        }

        .tbl-total-info tr>td:last-child {
            width: 40%;
            text-align: right;
            padding-right: 5px;
        }
    </style>
</head>

<body>

    {{-- @php
    dd($data);
@endphp --}}

    <div class="company_name">{{ env('APP_NAME') }}</div>
    <div class="company_address">{!! env('APP_COMPANY_ADDRESS') !!}</div>

    <div class="pdf_name">Release Item Invoice</div>

    <div class="tbl-header-wrapper">
        <table class="tbl-supplier-info">
            <tr>
                <td>
                    Customer Name:
                </td>
                <td>
                    {{ $data['user']['profile']['firstname'] }} {{ $data['user']['profile']['lastname'] }}
                </td>
            </tr>
            <tr>
                <td>
                    Address:
                </td>
                <td>
                    @if ($data['profile_address'])
                    {{ $data['profile_address']['address'] }}
                    @endif
                </td>
            </tr>
            <tr>
                <td>
                    TIN:
                </td>
                <td>
                    @if ($data['user'])
                    {{ $data['user']['profile']['taxpayer_identification'] }}
                    @endif
                </td>
            </tr>
            <tr>
                <td>Terms:</td>
                <td>Cash</td>
            </tr>
        </table>

        <table class="tbl-purchase-info">
            <tr>
                <td>
                    Date of Transaction:
                </td>
                <td>
                    {{ $data['date_sold'] ? date('F d, Y', strtotime($data['date_sold'])) : '' }}
                </td>
            </tr>
            <tr>
                <td>
                    Date Due:
                </td>
                <td>
                    {{ $data['date_due'] ? date('F d, Y', strtotime($data['date_due'])) : '' }}
                </td>
            </tr>
            <tr>
                <td>
                    Vat Type:
                </td>
                <td>
                    {{ $data['vat_type'] }}
                </td>
            </tr>
            <tr>
                <td>
                    EWT Type:
                </td>
                <td>
                    @if ($data['ewt_type'])
                    {{ $data['ewt_type']['ewt_type'] }}%
                    @endif
                </td>
            </tr>
            <tr>
                <td>
                    Invoice No.:
                </td>
                <td>
                    @if ($data['invoice_no'])
                    {{ $data['invoice_no'] }}
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <div class="purchase-details-wrapper">
        <table class="tbl-purchase-details">
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
                        Price per Unit
                    </th>
                    <th class="text-right">
                        Total Selling Price
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
                @foreach ($data['sales_order_details'] as $sales_detail)
                <tr>
                    <td class="text-center">
                        {{ $sales_detail['product_detail']['product']['product_name'] }}
                    </td>
                    <td class="text-center">
                        @if ($sales_detail['product_detail']['product_type'])
                        {{ $sales_detail['product_detail']['product_type']['product_type'] }}
                        @endif
                    </td>
                    <td class="text-center">
                        @if ($sales_detail['product_detail']['product_size'])
                        {{ $sales_detail['product_detail']['product_size']['product_size'] }}
                        @endif
                    </td>
                    <td class="text-right">
                        {{ $sales_detail['quantity'] }}
                    </td>
                    <td class="text-right">
                        <span class="DejaVuSans">₱</span> {{ $sales_detail['price'] }}
                    </td>
                    <td class="text-right">
                        <span class="DejaVuSans">₱</span> {{ $sales_detail['total_selling_price'] }}
                    </td>
                    <td class="text-right">
                        <span class="DejaVuSans">₱</span> {{ $sales_detail['vat'] }}
                    </td>
                    <td class="text-right">
                        <span class="DejaVuSans">₱</span> {{ $sales_detail['gross_amount'] }}
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
                        <span class="DejaVuSans">₱</span> {{ number_format($data['total_amount_payable'], 2) }}
                    </td>
                    <td class="text-right font-weight-bold">
                        <span class="DejaVuSans">₱</span> {{ number_format($data['value_added_tax'], 2) }}
                    </td>
                    <td class="text-right font-weight-bold">
                        <span class="DejaVuSans">₱</span> {{ number_format($data['total_gross_amount'], 2) }}
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
                    {{ number_format($data['total_gross_amount'], 2) }}
                </td>
            </tr>
            <tr>
                <td>
                    Add: Value-Added Tax
                </td>
                <td class="w-10px border-bottom"><span class="DejaVuSans">₱</span></td>
                <td class="border-bottom">
                    {{ number_format($data['value_added_tax'], 2) }}
                </td>
            </tr>
            <tr>
                <td class="font-weight-bold">
                    Total Amount Payable
                </td>
                <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                <td class="font-weight-bold">
                    {{ number_format($data['total_amount_payable'], 2) }}
                </td>
            </tr>
            <tr>
                <td>
                    Less: Withholding Tax
                </td>
                <td class="w-10px border-bottom"><span class="DejaVuSans">₱</span></td>
                <td class="border-bottom">
                    {{ number_format($data['withholding_tax'], 2) }}
                </td>
            </tr>
            <tr>
                <td class="font-weight-bold">
                    Amount Due
                </td>
                <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                <td class="font-weight-bold">
                    {{ number_format($data['amount_due'], 2) }}
                </td>
            </tr>
            <tr>
                <td>
                    Less: Discount
                </td>
                <td class="w-10px border-bottom"><span class="DejaVuSans">₱</span></td>
                <td class="border-bottom">
                    {{ number_format($data['discount'], 2) }}
                </td>
            </tr>
            <tr>
                <td class="font-weight-bold">
                    Net Amount Due
                </td>
                <td class="w-10px"><span class="DejaVuSans">₱</span></td>
                <td class="font-weight-bold">
                    {{ number_format($data['net_amount_due'], 2) }}
                </td>
            </tr>
        </table>
    </div>
</body>


</html>