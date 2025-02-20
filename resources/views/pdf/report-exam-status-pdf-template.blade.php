<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Exam Status Report</title>

    <style>
        @page {
            margin: .5in;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 0;
            padding: 0;
        }

        .fs-18 {
            font-size: 18px;
        }

        .text-red {
            color: red;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left !important;
        }

        .text-right {
            text-align: right !important;
        }

        .w-25 {
            width: 25px;
        }

        .w-50 {
            width: 50px;
        }

        .w-100 {
            width: 100px;
        }

        .w-150 {
            width: 150px;
        }

        .w-200 {
            width: 200px;
        }

        .w-250 {
            width: 250px;
        }

        .w-300 {
            width: 300px;
        }

        .m-0 {
            margin: 0;
        }

        .mt-25 {
            margin-top: 25px;
        }

        .mt-50 {
            margin-top: 50px;
        }

        .border {
            border: 1px solid #000000;
        }

        .cell-title {
            background-color: #2e74b5;
            color: white;
        }

        .cell-content {
            background-color: #f2f2f2;
        }
    </style>
</head>

<body>
    <table>
        <tbody>
            <tr>
                <td>
                    <img src="{{ $data['fsuu_logo'] }}" alt="fsuu_logo" height="100px" width="100px">
                </td>
                <td class="text-center" style="padding: 0px 50px;">
                    <h3 style="color: #002060; margin-bottom: 5px;">FATHER SATURNINO URIOS UNIVERSITY</h3>
                    <p style="font-size: 18px; font-weight: 600; margin: 0;">Butuan City 8600</p>
                </td>
                <td>
                    <img src="{{ $data['guidance_logo'] }}" alt="guidance_logo" height="100px" width="100px">
                </td>
            </tr>
        </tbody>
    </table>

    <div class="text-center mt-25">
        <h3 class="m-0">GUIDANCE CENTER</h3>
        <p class="fs-18 m-0">EXAM STATUS REPORT</p>
        @if (!empty($data['exam_status_report']) && isset($data['exam_status_report'][0]))
            <p class="fs-18 m-0">
                {{ $data['exam_status_report'][0]->semester }} AY {{ $data['exam_status_report'][0]->school_year }}
            </p>
        @else
            <p class="fs-18 m-0">No data available</p>
        @endif
    </div>

    <div class="mt-50">
        <table>
            <thead>
                <tr>
                    <th class="text-left">Date:</th>
                    <td class="w-150 text-left">
                        {{ $data['exam_status_report'][0]->exam_date ? \Carbon\Carbon::parse($data['exam_status_report'][0]->exam_date)->format('F d, Y') : 'N/A' }}
                    </td>
                </tr>
                <tr>
                    <th class="text-left">Time:</th>
                    <td class="w-150 text-left">{{ $data['exam_status_report'][0]->exam_time }}</td>
                </tr>
                <tr>
                    <th class="text-left">Venue:</th>
                    <td class="w-150 text-left">{{ $data['exam_status_report'][0]->exam_venue }}</td>
                </tr>
            </thead>
        </table>

        <table class="mt-25">
            <thead>
                <tr>
                    <th class="text-left w-200">Total Recorded Exams</th>
                </tr>
            </thead>
        </table>

        <table>
            <tbody>
                <tr class="cell-title">
                    <th class="text-left w-100">Examinees</th>
                    <th class="text-left w-100">Taken</th>
                    <th class="text-left w-100">Not Taken</th>
                </tr>
                <tr class="cell-content">
                    <td class="text-left w-100">{{ $data['exam_status_report']->count() }}</td>
                    <td class=" text
                    -left w-100">
                        {{ $data['exam_status_report']->where('exam_status', 'Taken')->count() }}</td>
                    <td class="text
                    -left w-100">
                        {{ $data['exam_status_report']->where('exam_status', 'Not Taken')->count() }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    @foreach ($data['exam_status_report']->sortBy('exam_category')->groupBy('exam_category') as $exam_category => $category_exam_status_report)
        <table class="mt-25">
            <thead>
                <tr>
                    <th class="text-left w-200">{{ $exam_category }} Examinees:
                        {{ $category_exam_status_report->count() }}
                    </th>
                </tr>
            </thead>
        </table>

        <table>
            <thead>
                <tr class="cell-title">
                    <th class="text-right w-50">No.</th>
                    <th class="text-left w-250">Examinee Name</th>
                    <th class="text-left w-100">Exam Status</th>
                    <th class="text-left w-150">Answer Sheet No.</th>
                    <th class="text-left w-100">Payment</th>
                </tr>
            </thead>
            <tbody>
            <tbody>
                @forelse ($category_exam_status_report->sortBy('fullname')->sortBy('exam_status') as $applicant)
                    <tr class="cell-content">
                        <td class="text-right w-50">{{ $loop->iteration }}</td>
                        <td class="text-left">{{ $applicant->fullname }}</td>
                        <td class="text-left w-100 {{ $applicant->exam_status == 'Not Taken' ? 'text-red' : '' }}">
                            {{ $applicant->exam_status }}</td>
                        <td class="text-left w-150">{{ $applicant->answer_sheet_no }}</td>
                        <td class="text-left w-100 {{ $applicant->payment_status == 'Not Paid' ? 'text-red' : '' }}">
                            {{ $applicant->payment_status }}</td>
                    </tr>
                @empty
                    <tr class="cell-content">
                        <td colspan="4" class="text-center">No examinees found.</td>
                    </tr>
                @endforelse
            </tbody>
            </tbody>
        </table>
    @endforeach
</body>

</html>
