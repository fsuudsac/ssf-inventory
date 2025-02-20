<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Testing Permit</title>

    <style>
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
            width: 450px;
        }

        .box::before {
            background: #28235b;
            content: "";
            position: absolute;
            height: 35px;
            width: 50%;
            top: -40;
            left: -40;
        }

        .box::after {
            background: #28235b;
            content: "";
            position: absolute;
            height: 35px;
            top: -40;
            left: 20;
            right: 0;
            transform: skewX(-45deg);
            transform-origin: top left;
            z-index: -1;
        }

        /* logo position top right */
        .logo {
            position: absolute;
            top: -10px;
            right: -250px;
        }

        .logo .guidance_logo {
            padding-top: 10px;
        }

        td {
            font-size: 20px;
        }

        /*  TESTING PERMIT */
        .testing-permit {
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div>
        <img class="fsuu_background" src="{{ $applicants['fsuu_bg'] }}" alt="fsuu_background">
    </div>

    <div class="box">
        <div>
            <h3 style=" margin-bottom: 0px; margin-top: 0px">Father Saturnino Urios
                University</h3> San Francisco St., Butuan City 8600
        </div>

        <div class="logo"> <img class="fsuu_logo" src="{{ $applicants['fsuu_logo'] }}" alt="fsuu_logo" height="100px"
                width="100px">
            <img class="guidance_logo" src="{{ $applicants['guidance_logo'] }}" alt="guidance_logo" height="100px"
                width="100px" style="border-radius: 50px;">

        </div>
    </div>


    <h1 style="margin-top: 50px;">TESTING PERMIT</h1>

    <Table>
        <td>
            @if ($applicants)
                <table style="width: 400px;">
                    <tr>
                        <td style="width: 100px">Full Name</td>
                        <td>
                        <td>
                        <td>
                        <td style="border-bottom: 2px solid; width: 300px">&emsp;{{ $applicants['fullname'] }}</td>
                    </tr>
                    <tr>
                        <td style="width: 100px">Exam</td>
                        <td>
                        <td>
                        <td>
                        <td style="border-bottom: 2px solid; width: 300px;">&emsp;{{ $applicants['exam_category'] }}
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 100px">Test Date</td>
                        <td>
                        <td>
                        <td>
                        <td style="border-bottom: 2px solid; width: 300px;">
                            &emsp;{{ date('F d, Y', strtotime($applicants['exam_date'])) }}</td>
                    </tr>
                    <tr>
                        <td style="width: 100px">Time</td>
                        <td>
                        <td>
                        <td>
                        <td style="border-bottom: 2px solid; width: 300px;">&emsp;{{ $applicants['exam_time'] }}</td>
                    </tr>
                    <tr>
                        <td style="width: 100px">Venue</td>
                        <td>
                        <td>
                        <td>
                        <td style="border-bottom: 2px solid; width: 300px;">&emsp;{{ $applicants['exam_room'] }}</td>
                    </tr>
                    <tr>
                        <td style="width: 100px">OR No.</td>
                        <td>
                        <td>
                        <td>
                        <td style="border-bottom: 2px solid; width: 300px;">&emsp;{{ $applicants['or_number'] }}</td>
                    </tr>
                    <tr>
                        <td style="width: 100px">Amount</td>
                        <td>
                        <td>
                        <td>
                        <td style="border-bottom: 2px solid; width: 300px;">&emsp;Php {{ $applicants['exam_fee'] }}.00
                        </td>
                    </tr>
                </table>
            @endif
        </td>

        <td style="width: 50px">

        <td>
            {{-- <div style="border: 2px solid; background-color: #ffffff;  height: 192px; width: 192px"></div> --}}
            <img src="{{ $applicants['profile_picture'] }}"
                style="border: 2px solid; background-color: #ffffff;  height: 192px; width: 192px">
            <p style=" font-size: 14px;text-align: center">2x2 Formal ID Picture</p>
        </td>
    </Table>

    <div class="instruction-wrapper">

        <table class="general-instructions">

            <h1>GENERAL INSTRUCTIONS</h1>

            <tr>
                <td>
                    <ol>
                        <li>Bring your <strong>TESTING PERMIT</strong> on your examination day.</li>
                        <li>Arrive early before 8: 00 AM. Late examinees will not be allowed to enter the testing
                            premises.
                        </li>
                        <li>Single-use plastic IS NOT ALLOWED inside the campus. Bring your own water
                            bottle/tumbler.</li>
                    </ol>
                </td>
            </tr>
        </table>

        <table class="to-bring">
            <h4 style="padding-bottom: 0px;">WHAT TO BRING</h4>
            <tr>
                <td>
                    <ul>
                        <li>Pencil (no. 2) and eraser</li>
                        <li>Black ballpen</li>
                        <li>Valid ID</li>
                    </ul>
                </td>
            </tr>
        </table>
</body>

</html>
