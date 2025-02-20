<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Result Template</title>

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
        border-collapse: collapse !important;
        margin-bottom: 20px;
    }

    td {
        font-size: 18px;
    }

    .fsuu_background {
        position: absolute;
        width: 702px;
        height: 900px;
        z-index: -1;
        opacity: 0.1;
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
    <div>
        <img class="fsuu_background" src="{{ $applicants['fsuu_bg'] }}" alt="fsuu_background">
    </div>

    <div class="box">
        <div class="name">
            <h3 style=" margin-bottom: 0px; margin-top: 0px">Father Saturnino Urios
                University</h3> San Francisco St., Butuan City 8600
        </div>

        <div class="logo"> <img class="fsuu_logo" src="{{ $applicants['fsuu_logo'] }}" alt="fsuu_logo" height="100px"
                width="100px">
            <img class="guidance_logo" src="{{ $applicants['guidance_logo'] }}" alt="guidance_logo" height="100px"
                width="100px">

        </div>
    </div>

    <table class="examinee-wrapper">
        <thead>
            <tr>
                <th>
                    <h1 style="margin: 0px 0px 20px 0px">EXAMINEE RESULTS SUMMARY</h1>
                </th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td>
                    @if ($applicants)
                    <table>
                        <tr>
                            <td>Full Name</td>
                            <td style="width: 20px"></td>
                            <td style="border-bottom: 2px solid; width: 300px">&emsp;{{ $applicants['fullname'] }}
                            </td>
                        </tr>
                        <tr>
                            <td>Test Date</td>
                            <td style="width: 20px"></td>
                            <td style="border-bottom: 2px solid; width: 300px">
                                &emsp;{{ date('F d, Y', strtotime($applicants['exam_date'])) }}
                            </td>
                        </tr>

                    </table>
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <h3 style="margin: 0px 0px 10px 40px">READINESS TEST FOR COLLEGE AND UNIVERSITIES (RTCU)</h3>
    <table class="RTCU">
        <thead>
            <tr>
                <th class="rtcu-header" style="width: 150px;">Subject</th>
                <th class="rtcu-header">ScS</th>
                <th class="rtcu-header">PR</th>
                <th class="rtcu-header">SN</th>
                <th class="rtcu-header" style="width: 200px;">Quality Index</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="rtcu-subject">English</td>
                <td class="rtcu-score">{{ $applicants['en_scaled_scrore'] }}</td>
                <td class="rtcu-score">{{ $applicants['en_percentile_rank'] }}</td>
                <td class="rtcu-score">{{ $applicants['en_stanine'] }}</td>
                <td class="rtcu-score"> @switch($applicants['en_quality_index'])
                    @case('L')
                    Low
                    @break

                    @case('A')
                    Average
                    @break

                    @case('H')
                    High
                    @break

                    @default
                    {{ $applicants['en_quality_index'] }}
                    @endswitch
                </td>
            </tr>

            <tr>
                <td class="rtcu-subject">Mathematics</td>
                <td class="rtcu-score">{{ $applicants['mt_scaled_scrore'] }}</td>
                <td class="rtcu-score">{{ $applicants['mt_percentile_rank'] }}</td>
                <td class="rtcu-score">{{ $applicants['mt_stanine'] }}</td>
                <td class="rtcu-score">
                    @switch($applicants['mt_quality_index'])
                    @case('L')
                    Low
                    @break

                    @case('A')
                    Average
                    @break

                    @case('H')
                    High
                    @break

                    @default
                    {{ $applicants['mt_quality_index'] }}
                    @endswitch
                </td>
            </tr>

            <tr>
                <td class="rtcu-subject">Science</td>
                <td class="rtcu-score">{{ $applicants['sc_scaled_scrore'] }}</td>
                <td class="rtcu-score">{{ $applicants['sc_percentile_rank'] }}</td>
                <td class="rtcu-score">{{ $applicants['sc_stanine'] }}</td>
                <td class="rtcu-score">
                    @switch($applicants['sc_quality_index'])
                    @case('L')
                    Low
                    @break

                    @case('A')
                    Average
                    @break

                    @case('H')
                    High
                    @break

                    @default
                    {{ $applicants['sc_quality_index'] }}
                    @endswitch
                </td>
            </tr>

            <tr style="border-bottom: 2px solid #000000;">
                <th class="rtcu-subject">Composite Score</th>
                <th class="rtcu-score">{{ $applicants['crs_scaled_score'] }}</th>
                <th class="rtcu-score">{{ $applicants['crs_percentile_rank'] }}</th>
                <th class="rtcu-score">{{ $applicants['crs_stanine'] }}</th>
                <th class="rtcu-score">
                    @switch($applicants['crs_quality_index'])
                    @case('L')
                    Low
                    @break

                    @case('A')
                    Average
                    @break

                    @case('H')
                    High
                    @break

                    @default
                    {{ $applicants['crs_quality_index'] }}
                    @endswitch
                </th>
            </tr>
        </tbody>
    </table>

    <h3 style=" margin: 0px 0px 10px 40px">OTIS-LENNON SCHOOL ABILITY TEST (OLSAT)</h3>
    <table class="OLSAT">
        <tbody>
            <tr>
                <th>Raw Score</th>
                <td style="padding-left: 60px;">{{ $applicants['raw'] }}</td>
            </tr>

            <tr>
                <th>SAI</th>
                <td style="padding-left: 60px;">{{ $applicants['sai'] }}</td>
            </tr>

            <tr>
                <th>Verbal Description</th>
                <td style="padding-left: 60px;">{{ $applicants['vd'] }}</td>
            </tr>
        </tbody>

    </table>

    <table class="note">
        <tbody>
            <tr>
                <p><strong>Important Note: </strong> This is a summray of your entrance examination performance.
                    Please
                    print your results and bring it with you <strong>on enrollment day.</strong></p>
            </tr>
        </tbody>
    </table>

</body>

</html>