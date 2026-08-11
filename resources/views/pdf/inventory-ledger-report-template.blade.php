<!-- filepath: /c:/Users/Max/Herd/DSAC/motolite_system/resources/views/pdf/report-ledger-inventory-report-template.blade.php -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REPORT-INVENTORY-LEDGER {{ date('Ymd-his') }}</title>

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
            border-collapse: collapse;
        }

        table,
        td,
        th {
            border: 1px solid #000;
        }

        th {
            background-color: #d3d3d3;
            /* Light gray background */
            padding: 8px;
            font-weight: bold;
            text-align: left;
        }

        td {
            padding: 8px;
            text-align: left;
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

        .page-break {
            page-break-after: always;
        }
    </style>


</head>

<body>
    <div class="company_name">{{ env('APP_NAME') }}</div>
    <div class="company_address">{!! env('APP_COMPANY_ADDRESS') !!}</div>

    <div class="pdf_name">Inventory Ledger</div>

    <table>
        <thead>
            <tr>
                {{-- <th class="text-left">Date Inventory</th>
                <th class="text-left">Warehouse</th> --}}
                <th class="text-left">Product</th>
                <th class="text-left">Size</th>
                <th class="text-left">Type</th>
                <th class="text-left">Status</th>
                <th class="text-left">Inventory Count</th>
            </tr>
        </thead>

        @foreach ($data as $inventory)
            <tbody>
                <tr>
                    {{-- <td class="text-left">{{ $inventory->date_inventory }}</td>
                    <td class="text-left">{{ $inventory->warehouse->warehouse_name }}</td> --}}
                    <td class="text-left">
                        {{ $inventory->product_name }}</td>
                    <td class="text-left">{{ $inventory->product_size }}</td>
                    <td class="text-left">{{ $inventory->product_type }}</td>
                    <td class="text-left">
                        @if ($inventory->available_stock == 0)
                            <span class="badge badge-warning">Out of Stock</span>
                        @elseif ($inventory->available_stock <= $inventory->reorder_point)
                            <span class="badge badge-warning">Low Inventory</span>
                        @else
                            <span class="badge badge-success">Higher than 'Reorder Point'</span>
                        @endif
                    </td>
                    <td class="text-left">{{ $inventory->available_stock }}</td>
                </tr>
            </tbody>
        @endforeach

    </table>

    {{-- @if (!$loop->last)
            <div class="page-break"></div>
        @endif --}}
</body>

</html>
