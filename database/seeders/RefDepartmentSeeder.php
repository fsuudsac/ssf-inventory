<?php

namespace Database\Seeders;

use App\Models\RefDepartment;
use Illuminate\Database\Seeder;

class RefDepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $departments = [
            [
                "abbr" => "AP",
                "department_name" => "Accountancy Program",
                "courses" => [
                    [
                        "course_name" => "Bachelor of Science in Accountancy",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Science in Accounting Information System"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Internal Auditing"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Management Accounting"
                    ],
                ]
            ],
            [
                "abbr" => "ASP",
                "department_name" => "Arts and Sciences Program",
                "courses" => [
                    [
                        "course_name" => "Bachelor of Science in Applied Mathematics"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Biology"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Psychology",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Arts in Communication"
                    ],
                    [
                        "course_name" => "Bachelor of Arts in Economics"
                    ],
                    [
                        "course_name" => "Bachelor of Arts in English Language Studies"
                    ],
                    [
                        "course_name" => "Bachelor of Arts in History"
                    ],
                    [
                        "course_name" => "Bachelor of Arts in Human Services"
                    ],
                    [
                        "course_name" => "Bachelor of Arts in Political Science"
                    ],
                    [
                        "course_name" => "Batsilyer ng Sining sa Filipino"
                    ],
                    [
                        "course_name" => "Bachelor of Public Administration"
                    ],
                ]
            ],
            [
                "abbr" => "BAP",
                "department_name" => "Business Administration Program",
                "courses" => [
                    [
                        "course_name" => "Bachelor of Science in Business Administration - Operations Management"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Business Administration - Financial Management"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Business Administration - Marketing Management"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Business Administration - Human Resource Management"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Social Entrepreneurship "
                    ],
                    [
                        "course_name" => "Bachelor of Science in Social Entrepreneurship (with specialization in Agri-Aqua Business)"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Social Entrepreneurship (with specialization in Arts and Crafts Business)"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Office Administration"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Office Administration (with specialization in Industry Office Management)"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Office Administration (with specialization in Legal Office Management)"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Hospitality Management"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Tourism Management"
                    ],
                ]
            ],
            [
                "abbr" => "CSP",
                "department_name" => "Computer Studies Program",
                "courses" => [
                    [
                        "course_name" => "Bachelor of Science in Computer Science"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Computer Science (with special training in Data Science & Analytics)"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Information Technology "
                    ],
                    [
                        "course_name" => "Bachelor of Science in Entertainment and Multimedia Computing"
                    ],
                    [
                        "course_name" => "Bachelor of Science in Entertainment and Multimedia Computing (with specialization in Game Development)"
                    ],
                    [
                        "course_name" => "Bachelor in Library and Information Science"
                    ],
                ]
            ],
            [
                "abbr" => "CJEP",
                "department_name" => "Criminal Justice Education Program",
                "courses" => [
                    [
                        "course_name" => "Bachelor of Science in Criminology",
                        "board_exam" => 1
                    ]
                ]
            ],
            [
                "abbr" => "ETP",
                "department_name" => "Engineering and Technology Program",
                "courses" => [
                    [
                        "course_name" => "Bachelor of Science in Civil Engineering",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Science in Industrial Engineering"
                    ]
                ]
            ],
            [
                "abbr" => "NP",
                "department_name" => "Nursing Program",
                "courses" => [
                    [
                        "course_name" => "Bachelor of Science in Nursing",
                        "board_exam" => 1
                    ]
                ]
            ],
            [
                "abbr" => "TEP",
                "department_name" => "Teacher Education Program",
                "courses" => [
                    [
                        "course_name" => "Bachelor of Elementary Education",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Early Childhood Education",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Secondary Education - English",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Secondary Education - Filipino",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Secondary Education - Mathematics",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Secondary Education - Sciences",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Secondary Education - Social Studies",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Special Needs Education",
                        "board_exam" => 1
                    ],
                    [
                        "course_name" => "Bachelor of Physical Education",
                        "board_exam" => 1
                    ],

                ]
            ],
            [
                "abbr" => "CL",
                "department_name" => "College of Law",
                "courses" => [
                    [
                        "course_name" =>  "Juris Doctor"
                    ]
                ]
            ],
            [
                "abbr" => "GSP",
                "department_name" => "Graduate Studies Program",
                "courses" => [
                    [
                        "course_name" => "Doctor in Business Administration"
                    ],
                    [
                        "course_name" => "Doctor in Management major in Organizational Development"
                    ],
                    [
                        "course_name" => "Doctor of Philosophy in Education"
                    ],
                    [
                        "course_name" => "Master of Science in Physical Education"
                    ],
                    [
                        "course_name" => "Master of Science in Teaching Mathematics"
                    ],
                    [
                        "course_name" => "Master of Arts in Educational Management"
                    ],
                    [
                        "course_name" => "Master of Arts in Guidance and Counseling"
                    ],
                    [
                        "course_name" => "Master of Arts in Nursing"
                    ],
                    [
                        "course_name" => "Master of Arts in Nursing (with special training courses in Nursing Administration and Supervision)"
                    ],
                    [
                        "course_name" => "Master of Arts in Nursing (with special training courses in Medical-Surgical Nursing)"
                    ],
                    [
                        "course_name" => "Master of Arts in Teaching English"
                    ],
                    [
                        "course_name" => "Master of Arts in Teaching Filipino"
                    ],
                    [
                        "course_name" => "Master of Arts in Teaching General Science"
                    ],
                    [
                        "course_name" => "Master of Arts in Teaching Special Education"
                    ],
                    [
                        "course_name" => "Master in Public Administration"
                    ],
                    [
                        "course_name" => "Master in Business Administration"
                    ],
                    [
                        "course_name" => "Master in Business Administration (with specialization in Business Management)"
                    ],
                    [
                        "course_name" => "Master in Business Administration (with specialization in Human Resource Management)"
                    ],
                ]
            ],
        ];

        \App\Models\RefDepartment::truncate();
        \App\Models\RefCourse::truncate();

        foreach ($departments as $department) {
            $departmentCreated = \App\Models\RefDepartment::create([
                "abbr" => $department["abbr"],
                "department_name" => $department["department_name"],
                "created_by" => 1,
            ]);

            foreach ($department["courses"] as $course) {
                \App\Models\RefCourse::create([
                    "department_id" => $departmentCreated->id,
                    "course_name" => $course["course_name"],
                    "board_exam" => $course["board_exam"] ?? 0,
                    "created_by" => 1,
                ]);
            }
        }
    }
}
