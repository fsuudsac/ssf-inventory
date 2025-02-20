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
        .examinee-wrapper {
            margin: 0px 0px 20px 40px;
        }

        /* GLT TABLE*/
        /* Standard score */
        .standard-score {
            width: 250px;
        }

        .standard-score .tbody {
            border: 1px red solid
        }

        .standard-score .standard-score-header {
            padding: 10px 20px 10px 20px;
            text-align: left;

            background-color: #244683;
            font-weight: normal !important;
            font-size: 14px !important;
            color: #ffffff;
        }

        .standard-score .standard-score-subject {
            padding: 10px 20px 10px 20px;
            text-align: left;
            width: 300px;
            font-weight: 700;
        }

        .standard-score .standard-score-score {
            text-align: center;
            font-weight: 700;

        }

        /* General Aptitude Score */
        .general-score {
            width: 250px;
        }

        .general-score .tbody {
            border: 1px red solid
        }

        .general-score .general-score-header {
            padding: 10px 20px 10px 20px;
            text-align: left;

            background-color: #244683;
            font-weight: normal !important;
            font-size: 14px !important;
            color: #ffffff;
        }

        .general-score .general-score-subject {
            padding: 10px 20px 10px 20px;
            text-align: left;
            width: 235px;
            background-color: #2446834f;
            border: #ffffff 2px solid;
        }

        .general-score .general-score-score {
            text-align: center;
            background-color: #2446834f;
            border: #ffffff 2px solid;
            width: 100px;

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
                                <td style="border-bottom: 2px solid;">&emsp;{{ $applicants['fullname'] }}
                                </td>
                            </tr>
                            <tr>
                                <td>Test Date</td>
                                <td style="width: 20px"></td>
                                <td style="border-bottom: 2px solid;">
                                    &emsp;{{ date('F d, Y', strtotime($applicants['exam_date'])) }}
                                </td>
                            </tr>

                        </table>
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <h3 style="margin: 0px 0px 10px 40px;">GRADUATE LEVEL TEST (GLT)</h3>
    <table class="standard-score" style="padding:20px 0px 0px 200px">
        <thead>
            <tr>
                <th class=" standard-score-header" style="width: 100%;  padding: 20px 5px 20px 20px;">
                    STANDARD
                    SCORE</th>

                <th class="standard-score-header"></th>
            </tr>
        </thead>
        <tbody style="margin-left: 100px">
            <tr>
                <td class="standard-score-subject">Verbal (V)</td>
                <td class="standard-score-score">{{ $applicants['v'] }}</td>
            </tr>

            <tr>
                <td class="standard-score-subject">Quantitative (Q)</td>
                <td class="standard-score-score">{{ $applicants['q'] }}</td>
            </tr>

            <tr style="padding-bottom: 40px;">
                <td class="standard-score-subject">Inductive Reasoning (IR)</td>
                <td class="standard-score-score">{{ $applicants['ir'] }}</td>
            </tr>
        </tbody>
    </table>

    <table class="general-score" style="padding:20px 0px 0px 200px">
        <thead>
            <tr>
                <th class=" general-score-header" style="width: 100%;  padding: 20px 5px 20px 20px;">
                    GENERAL APTITURE SCORE</th>

                <th class="general-score-header"></th>
            </tr>
        </thead>
        <tbody style="margin-left: 100px">
            <tr>
                <td class="general-score-subject">Standard Score</td>
                <td class="general-score-score">{{ $applicants['ss'] }}</td>
            </tr>

            <tr>
                <td class="general-score-subject">Percentile Rank</td>
                <td class="general-score-score">{{ $applicants['pr'] }}</td>
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
