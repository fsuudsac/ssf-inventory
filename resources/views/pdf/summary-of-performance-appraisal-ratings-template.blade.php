<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Summary of performance appraisal ratings</title>

    <style>
        @page {
            margin: 0.5em;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f747;
            margin: 0;
            padding: 0;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p {
            padding: 0px;
            margin: 0px;
        }

        table {
            width: 100%;
            /* border: 1px solid red */
        }

        td {
            text-align: center;
        }

        .text-center {
            text-align: center;
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
            border-bottom: 1px solid rgba(0, 0, 0, 0.8);
        }

        .m-0 {
            margin: 0px !important;
        }

        .mt-30 {
            margin-top: 30px;
        }

        .mb-30 {
            margin-bottom: 30px;
        }

        .page-break {
            page-break-after: always;
        }

        table {
            border-collapse: collapse;
        }

        .tbl-header {
            margin-top: 30px;
        }

        .tbl-header td {
            border: 1px solid rgba(0, 0, 0, 0.8);
        }

        .tbl-header td.label {
            position: relative;
        }

        .tbl-header td.label::after {
            content: ':';
            position: absolute;
            right: 0;
        }

        .tbl-header td:first-child {
            width: 18%;
        }

        .tbl-header td:nth-child(2) {
            width: 62%;
        }

        .tbl-header td:nth-child(3) {
            width: 10%;
        }

        .tbl-header td:last-child {
            width: 10%;
        }

        .tbl-header td:last-child div {
            text-align: center;
            border-bottom: 1px solid rgba(0, 0, 0, 0.8);
        }

        .tbl-question-category {
            margin-top: 20px;
        }

        .tbl-question-category th,
        .tbl-question-category td {
            border: 1px solid rgba(0, 0, 0, 0.8);
        }

        .tbl-question-category th.indicators {
            width: 70%;
        }

        .tbl-question-category th.individual {
            width: 30%;
        }

        .quill-output p,
        .quill-output h1,
        .quill-output h2,
        .quill-output h3,
        .quill-output h4,
        .quill-output h5,
        .quill-output ul,
        .quill-output ol {

            width: 600px;
        }
    </style>
</head>

<body>
    @foreach ($dataFaculty as $item)
        <h3 class="text-center">SUMMARY OF PERFORMANCE APPRAISAL RATINGS</h3>
        <p class="text-center">{{ $dataForm->semester }}, SY {{ $dataForm->schooL_year_info }}</p>

        <table class="tbl-header">
            <tbody>
                <tr>
                    <td class="text-left label">Teacher's Name</td>
                    <td class="text-left">{{ $item['fullname'] }}</td>
                    <td class="text-left label">Tenured</td>
                    <td class="text-left">
                        <div>/</div>
                    </td>
                </tr>
                <tr>
                    <td class="text-left label">Program</td>
                    <td class="text-left">{{ $item['department_name'] }}</td>
                    <td class="text-left"></td>
                    <td class="text-left"></td>
                </tr>
            </tbody>
        </table>

        <table class="tbl-question-category">
            <thead>
                <tr>
                    <th rowspan="2" class="indicators">Indicators</th>
                    <th colspan="2" class="individual">Individual</th>
                </tr>
                <tr>
                    <th>Mean</th>
                    <th>VD</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($dataForm['form_question_categories'] as $item)
                    <tr>
                        <td colspan="3" class="text-left quill-output">{!! $item['category'] !!}</td>
                    </tr>

                    @foreach ($item['form_questions'] as $question)
                        <tr>
                            <td class="text-left quill-output">{!! $question['question'] !!}</td>
                            <td>5.00</td>
                            <td>Always</td>
                        </tr>
                    @endforeach
                @endforeach
            </tbody>
        </table>


        <div class="page-break"></div>
    @endforeach
</body>

</html>
