<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Summary of student profiling report</title>

    <style>
        * {
            font-family: "DeJaVu Sans Mono", monospace;
        }

        .text-center {
            text-align: center;
        }

        .text-grey {
            color: #878787 !important;
        }

        .italic {
            font-style: italic;
        }

        .header-style {
            margin-bottom: 0px;
            margin-top: 0px;
            color: #002060;
        }

        .paragraph-style {
            margin-bottom: 0px;
            margin-top: 0px;
            font-size: 18px;
            font-weight: 600
        }

        .w-50 {
            width: 50px;
        }

        .w-100 {
            width: 100px;
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

        .w-350 {
            width: 350px;
        }

        .m-0 {
            margin: 0px;
        }

        .mt-10 {
            margin-top: 10px;
        }

        .mt-100 {
            margin-top: 100px;
        }

        .mb-0 {
            margin-bottom: 0px !important;
        }

        .p-0 {
            padding: 0px;
        }

        .p-10 {
            padding: 10px;
        }

        .fw-600 {
            font-weight: 600;
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

        .border {
            border: 1px solid #000000;
        }

        .border-b {
            border-bottom: 1px solid #000000;
        }

        /* Table */
        .gender-table,
        .course-table,
        .strand-table,
        .rtcu-english-table,
        .rtcu-mathematics-table,
        .rtcu-science-table,
        .rtcu-composite-table,
        .rtcu-olsat-table {
            border: 1px solid #b3adad;
            border-collapse: collapse;
            padding: 5px 5px 0px 5px;
        }

        .gender-table th,
        .course-table th,
        .strand-table th,
        .rtcu-english-table th,
        .rtcu-mathematics-table th,
        .rtcu-science-table th,
        .rtcu-composite-table th,
        .rtcu-olsat-table th {
            border: 1px solid #000000;
            padding: 5px 5px 0px 5px;
            background: #2e74b5;
            color: #ffffff;
        }

        .gender-table td,
        .course-table td,
        .strand-table td,
        .rtcu-english-table td,
        .rtcu-mathematics-table td,
        .rtcu-science-table td,
        .rtcu-composite-table td,
        .rtcu-olsat-table td {
            border: 1px solid #000000;
            text-align: center;
            background: #ffffff;
            color: #313030;
        }

        .gender-table tfoot td,
        .course-table tfoot td,
        .strand-table tfoot td,
        .rtcu-english-table tfoot td,
        .rtcu-mathematics-table tfoot td,
        .rtcu-science-table tfoot td,
        .rtcu-composite-table tfoot td,
        .rtcu-olsat-table tfoot td {
            border: 1px solid #000000;
            padding: 5px 5px 0px 5px;
            background: #ddebf7;
            color: #000000;
            font-weight: 600
        }
    </style>

</head>

{{-- @php
    dd($data['student_profiling_report']);
@endphp --}}

<body>
    <table>
        <tbody>
            <tr>
                <td>
                    <img class="fsuu_logo" src="{{ $data['fsuu_logo'] }}" alt="fsuu_logo" height="100px" width="100px">
                </td>

                <td class="text-center" style="padding: 0px 50px;">
                    <h3 class="header-style">FATHER SATURNINO URIOS UNIVERSITY</h3>
                    <p class="paragraph-style">Butuan City 8600</p>
                </td>

                <td>
                    <img class="guidance_logo" src="{{ $data['guidance_logo'] }}" alt="guidance_logo" height="100px"
                        width="100px">
                </td>
            </tr>
        </tbody>
    </table>

    @foreach ($data['student_profiling_report'] as $key => $item)
        <div class="text-center" style="margin-top: 25px">
            <h3 class="mb-0">GUIDANCE CENTER</h3>
            <p style="font-size: 18px; margin: 0px">STUDENT PROFILING REPORT</p>
            <p style="margin-bottom: 0px; margin-top: 0px; font-size: 18px; font-style: italic;">
                {{ $item['department_name'] }}</p>
            <p style="font-size: 18px; margin: 0px">{{ $item['semester'] }} AY
                {{ $item['school_year'] }}</p>
        </div>

        <br>
        {{-- Gender --}}
        <h4 class="mb-0">Table 1: Students grouped according to Gender</h4>
        <table class="gender-table">
            <thead>
                <tr>
                    <th class="w-250 text-left">Gender</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-left">&nbsp;Female </td>
                    <td class="text-right">&nbsp;{{ $item['countFemale'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;Male</td>
                    <td class="text-right">&nbsp;{{ $item['countMale'] }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="text-left">Total</td>
                    <td class="text-right">{{ $item['total'] }}</td>
                </tr>
            </tfoot>
        </table>

        First Course
        <h4 class="mb-0">Table 2: Students’ first course preference</h4>
        <table class="course-table">
            <thead>
                <tr>
                    <th style="width: 550px; text-align: left">Course 1</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            @if ($item['firstCourseCounts'])
                @forelse ($item['firstCourseCounts'] as $course => $count)
                    <tr>
                        <td class="text-left">&nbsp;{{ $course }}</td>
                        <td class="text-right">&nbsp;{{ $count }}</td>
                    </tr>
                @empty
                    <tr>
                        <td class="text-left text-grey">&nbsp;Course...</td>
                        <td class="text-right text-grey">&nbsp;0</td>
                    </tr>
                @endforelse
            @endif



            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['totalFirstCourse'] }}</td>
                </tr>
            </tfoot>
        </table>

        {{-- Second Course --}}
        <h4 class="mb-0">Table 3: Students’ second course preference</h4>
        <table class="course-table">
            <thead>
                <tr>
                    <th style="width: 550px; text-align: left">Course 2</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            @if ($item['secondCourseCounts'])
                @forelse ($item['secondCourseCounts'] as $course => $count)
                    <tr>
                        <td class="text-left">&nbsp;{{ $course }}</td>
                        <td class="text-right">&nbsp;{{ $count }}</td>
                    </tr>
                @empty
                    <tr>
                        <td class="text-left text-grey">&nbsp;Course...</td>
                        <td class="text-right text-grey">&nbsp;0</td>
                    </tr>
                @endforelse
            @endif

            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['totalSecondCourse'] }}</td>
                </tr>
            </tfoot>
        </table>

        {{-- Third Course --}}
        <h4 class="mb-0">Table 4: Students’ third course preference</h4>
        <table class="course-table">
            <thead>
                <tr>
                    <th style="width: 550px; text-align: left">Course 3</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            @if ($item['thirdCourseCounts'])
                @forelse ($item['thirdCourseCounts'] as $course => $count)
                    <tr>
                        <td class="text-left">&nbsp;{{ $course }}</td>
                        <td class="text-right">&nbsp;{{ $count }}</td>
                    </tr>
                @empty
                    <tr>
                        <td class="text-left text-grey">&nbsp;Course...</td>
                        <td class="text-right text-grey">&nbsp;0</td>
                    </tr>
                @endforelse
            @endif
            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['totalThirdCourse'] }}</td>
                </tr>
            </tfoot>
        </table>

        {{-- Strand --}}
        <h4 class="mb-0">Table 5: Students’ Senior High School Strand</h4>
        <table class="strand-table">
            <thead>
                <tr>
                    <th class="w-350 text-left">Strand</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            @if ($item['strandCourseCounts'])
                @forelse ($item['strandCourseCounts'] as $course => $count)
                    <tr>
                        <td class="text-left">&nbsp;{{ $course }}</td>
                        <td class="text-right">&nbsp;{{ $count }}</td>
                    </tr>
                @empty
                    <tr>
                        <td class="text-left text-grey">&nbsp;Strand...</td>
                        <td class="text-right text-grey">&nbsp;0</td>
                    </tr>
                @endforelse
            @endif
            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['totalStrandCourse'] }}</td>
                </tr>
            </tfoot>
        </table>

        {{-- RTCU-English --}}
        <h4 class="mb-0">Table 6: Students’ RTCU-English subtest performance</h4>
        <table class="rtcu-english-table">
            <thead>
                <tr>
                    <th class="w-350 text-left">ENG QI</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-left">&nbsp;Low (Stanines 1-3)</td>
                    <td class="text-right">&nbsp;{{ $item['en_qi_L'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;Average (Stanines 4-6)</td>
                    <td class="text-right">&nbsp;{{ $item['en_qi_A'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;High (Stanines 7-9) </td>
                    <td class="text-right">{{ $item['en_qi_H'] }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['total'] }}</td>
                </tr>
            </tfoot>
        </table>

        {{-- RTCU-Mathematics --}}
        <h4 class="mb-0">Table 7: Students’ RTCU-Mathematics subtest performance</h4>
        <table class="rtcu-mathematics-table">
            <thead>
                <tr>
                    <th class="w-350 text-left">MT QI</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-left">&nbsp;Low (Stanines 1-3)</td>
                    <td class="text-right">&nbsp;{{ $item['mt_qi_L'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;Average (Stanines 4-6)</td>
                    <td class="text-right">&nbsp;{{ $item['mt_qi_A'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;High (Stanines 7-9) </td>
                    <td class="text-right">&nbsp;{{ $item['mt_qi_H'] }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['total'] }}</td>
                </tr>
            </tfoot>
        </table>

        {{-- RTCU-Science --}}
        <h4 class="mb-0">Table 8: Students’ RTCU-Science subtest performance</h4>
        <table class="rtcu-science-table">
            <thead>
                <tr>
                    <th class="w-350 text-left">SC QI</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-left">&nbsp;Low (Stanines 1-3)</td>
                    <td class="text-right">&nbsp;{{ $item['sc_qi_L'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;Average (Stanines 4-6)</td>
                    <td class="text-right">&nbsp;{{ $item['sc_qi_A'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;High (Stanines 7-9) </td>
                    <td class="text-right">&nbsp;{{ $item['sc_qi_H'] }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['total'] }}</td>
                </tr>
            </tfoot>
        </table>

        {{-- RTCU-Composite --}}
        <h4 class="mb-0">Table 9: Students’ RTCU Composite Scores</h4>
        <table class="rtcu-composite-table">
            <thead>
                <tr>
                    <th class="w-350 text-left">CRS QI</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-left">&nbsp;Low (Stanines 1-3)</td>
                    <td class="text-right">&nbsp;{{ $item['crs_qi_L'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;Average (Stanines 4-6)</td>
                    <td class="text-right">&nbsp;{{ $item['crs_qi_A'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;High (Stanines 7-9) </td>
                    <td class="text-right">&nbsp;{{ $item['crs_qi_H'] }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['total'] }}</td>
                </tr>
            </tfoot>
        </table>

        {{-- RTCU-OLSAT --}}
        <h4 class="mb-0">Table 10: Students Otis-Lennon School Ability Test (OLSAT) scores</h4>
        <table class="rtcu-olsat-table">
            <thead>
                <tr>
                    <th class="w-350 text-left">OLSAT</th>
                    <th class="w-50 text-right">f</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-left">&nbsp;Below Average ( &#8804; 88 ) </td>
                    <td class="text-right">&nbsp;{{ $item['vd_BA'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;Average (89-111)</td>
                    <td class="text-right">&nbsp;{{ $item['vd_A'] }}</td>
                </tr>
                <tr>
                    <td class="text-left">&nbsp;Above Average ( &#8805; 112 )</td>
                    <td class="text-right">&nbsp;{{ $item['vd_AA'] }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="text-left">Grand Total</td>
                    <td class="text-right">{{ $item['total'] }}</td>
                </tr>
            </tfoot>
        </table>

        <p class="mt-100">Prepared by:</p>

        @if ($item['department_name'] == 'ASP - Arts and Sciences Program' || $item['department_name'] == 'NP - Nursing Program')
            <div class="text-center w-300">
                <p class="border-b m-0 mt-10 fw-600">KARL ADAMS C. SORIA</p>
                <p class="m-0">Guidance Counselor</p>
                <p class="m-0 italic">ASP, NP</p>
            </div>
        @endif

        @if (
            $item['department_name'] == 'AP - Accountancy Program' ||
                $item['department_name'] == 'CP - Criminology Program' ||
                $item['department_name'] == 'CSP - Computer Studies Program')
            <div class="text-center w-300">
                <p class="border-b m-0 mt-10 fw-600">BEAH ANNGELINE CULTURA</p>
                <p class="m-0">Guidance Counselor</p>
                <p class="m-0 italic">AP, CJEP, CSP</p>
            </div>
        @endif

        @if (
            $item['department_name'] == 'BAP - Business Administration Program' ||
                $item['department_name'] == 'ETP - Education and Teacher Training Program')
            <div class="text-center w-300">
                <p class="border-b m-0 mt-10 fw-600">MA. LOUISSA F. SINADJAN, RPm</p>
                <p class="m-0">Guidance Counselor</p>
                <p class="m-0 italic">BAP, ETP</p>
            </div>
        @endif

        @if ($item['department_name'] == 'TEP - Teachers Education Program')
            <div class="text-center w-300">
                <p class="border-b m-0 mt-10 fw-600">JOCELYN C. OCLARIT, RPm, RPsyc</p>
                <p class="m-0">Director, Guidance Center</p>
                <p class="m-0 italic">TEP, COL, GSR</p>
            </div>
        @endif

        <p>Noted:</p>
        <div class="text-center w-300">
            <p class="border-b m-0 mt-10 fw-600">JOCELYN C. OCLARIT, RPm, RPsyc</p>
            <p class="m-0">Director, Guidance Center</p>
        </div>


        @if ($key < count($data['student_profiling_report']) - 1)
            <div style="page-break-after: always;"></div>
        @endif
    @endforeach

</body>

</html>
