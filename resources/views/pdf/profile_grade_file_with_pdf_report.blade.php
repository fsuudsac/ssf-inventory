<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faculty Load Report</title>

    <style>
        @page {
            margin: 0;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f747;
            margin: 0;
            padding: 0;
        }

        h1,
        h3,
        h4 {
            color: #29235c;
        }

        table {
            width: 98%;
            border-collapse: collapse !important;
            margin-bottom: 20px;
            margin: 0 auto;
        }

        .tbl-content {
            margin-top: 30px;
        }

        .tbl-content tbody tr td {
            vertical-align: top;
        }

        .tbl-content td,
        .tbl-content th {
            border: 1px solid #000;
            padding: 3px;
            text-align: left;
        }

        td {
            font-size: 18px;
        }

        .text-center {
            text-align: center !important;
        }


        .text-left {
            text-align: left;
        }

        .text-right {
            text-align: right;
            font-weight: 600;
        }

        .text-bold {
            font-weight: 600;
            /* border: 1px solid red; */
        }

        .w-20 {
            width: 20%;
        }

        .w-22 {
            width: 22%;
        }

        .w-24 {
            width: 24%;
        }

        .w-25 {
            width: 25%;
        }

        .w-28 {
            width: 28%;
        }

        .w-34 {
            width: 34%;
        }

        .w-40 {
            width: 50%;
        }

        .w-50 {
            width: 50%;
        }

        .w-100 {
            width: 100%;
        }

        .border-bottom {
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .m-0 {
            margin: 0px !important;
        }

        .mt-30 {
            margin-top: 30px;
        }

        .mb-0 {
            margin-bottom: 0px;
        }

        .mb-30 {
            margin-bottom: 30px;
        }


        .line-break {
            border-top: 2px dashed #000000;
        }

        .page-break {
            page-break-after: always;
        }

        .content {
            background-position: absolute;
            background-size: cover;
        }



        .fsuu_background-wrapper {
            position: relative;
        }

        .fsuu_background {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 702px;
            height: 900px;
            z-index: -1;
            opacity: 0.1;
            transform: translate(-50%, -50%);
        }

        /* shape */
        .box {
            position: relative;
            width: 500px;
        }

        .box::before {
            background: #28235b;
            content: "";
            position: absolute;
            height: 35px;
            width: 50%;
            top: -5;
            left: -40;
        }

        .box::after {
            background: #28235b;
            content: "";
            position: absolute;
            height: 35px;
            top: -5;
            left: 20;
            right: 0;
            transform: skewX(-45deg);
            transform-origin: top left;
            z-index: -1;
        }

        /* logo position top right */
        .logo {
            position: absolute;
            top: 35px;
            right: -250px;
        }

        .logo .guidance_logo {
            padding-top: 10px;
        }

        /* name positioning */
        .name {
            margin: 40px 0px 40px 40px;
        }


        /* EXAMINEE RESULTS SUMMARY */
        .examinee-wrapper,
        .OLSAT,
        .RTCU {
            margin: 0px 0px 20px 40px;
        }

        /* RTCU TABLE*/
        .RTCU .rtcu-header {
            margin: 0px 0px 20px 40px;
            padding: 10px 20px 10px 20px;
            text-align: center;
            gap: 0px;

            background-color: #29235c;
            font-weight: normal !important;
            font-size: 14px !important;
            color: #ffffff;
            border: 2px solid #000000;
        }

        .RTCU .rtcu-subject {
            padding: 10px 20px 10px 20px;
            border-left: 2px solid #000000;
            text-align: left;
        }

        .RTCU .rtcu-score {
            border-left: 2px solid #000000;
            border-right: 2px solid #000000;
            text-align: center;
        }

        /* OLSAT TABLE */
        .OLSAT th {
            text-align: left;
        }

        /* NOTE */
        .note {
            margin: 50px 0px 20px 40px;
            width: 90%;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="fsuu_background-wrapper">
        <img class="fsuu_background" src="{{ $system_logo_bg }}" alt="fsuu_background">
    </div>

    <div class="box">
        <div class="name">
            <h3 style=" margin-bottom: 0px; margin-top: 0px">Father Saturnino Urios
                University</h3> San Francisco St., Butuan City 8600
        </div>

        <div class="logo">
            <img class="fsuu_logo" src="{{ $system_logo }}" alt="fsuu_logo" height="100px" width="100px">
        </div>
    </div>

    @foreach ($data as $item)
        <div class="content-wrapper">
            <div class="header-info">
                <div class="name">Name: {{ $item->fullname }}</div>
            </div>
        </div>
    @endforeach
</body>

</html>
