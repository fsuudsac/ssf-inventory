<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        EmailTemplate::truncate();


        $data = [
            [
                'title' => 'ACCOUNT REGISTRATION',
                'subject' => 'FSUU OPIS Registration',
                'body' => '<p>Welcome!</p><p><br></p><p>You are registering an FSUU OPIS account. Your details are found below:</p><p><br></p><p>Account Name: [user:account]</p><p>Password: [user:password]</p><p><br></p><p>Thank you for considering Father Saturnino Urios University, and we look forward in welcoming you to be part of the Urian community.</p><p><br></p><p><br></p><p>Keep safe and healthy,</p><p></p><p>This is an automated email. Please do not reply.</p>',
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'ADMISSION EXAM APPOINTMENT',
                'subject' => 'FSUU Admission Exam Appointment',
                'body' => '<p>Hello there, [user:to_name].</p><p><br></p><p>This is to confirm your ADMISSION EXAM APPOINTMENT. Please take a look at the attached file of your Testing Permit with your examination details. Please bring a printed copy of your permit on the day of your examination along with your other materials indicated in the Testing Permit.</p><p><br></p><p>Thank you for considering Father Saturnino Urios University, and we look forward in welcoming you to be part of the Urian community.</p><p><br></p><p>Keep safe and healthy,</p><p></p><p>This is an automated email. Please do not reply.</p>',
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'ADMISSION EXAM (EXAM TAKEN)',
                'subject' => 'FSUU Admission Exam Appointment',
                'body' => '<p>Hi there, [user:to_name].</p><p><br></p><p>You are a step closer in becoming part of our growing community.</p><p><br></p><p>This is to confirm and verify that you have TAKEN the Admission Exam. Kindly wait for another email for your exam results.</p><p><br></p><p>Thank you for considering Father Saturnino Urios University, and we look forward in welcoming you to be part of the Urian community.</p><p><br></p><p><br></p><p>Keep safe and healthy,</p><p><br></p><p>[email signature]</p><p><br></p><p>This is an automated email. Please do not reply.</p>',
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'ADMISSION EXAM (SPAM)',
                'subject' => 'FSUU Admission Exam Appointment',
                'body' => '<p>Hi there, (insert Name).&nbsp;</p><p><br></p><p>You are a step closer in becoming part of our growing community.</p><p><br></p><p>This is to confirm and verify that you have TAKEN the Admission Exam. Kindly wait for another email for your exam results.</p><p><br></p><p>Thank you for considering Father Saturnino Urios University, and we look forward in welcoming you to be part of the Urian community.</p><p><br></p><p>Keep safe and healthy,</p><p><br></p><p>[email signature]</p><p><br></p><p>This is an automated email. Please do not reply.</p>',
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'RESULTS',
                'subject' => 'FSUU Admission Test Results',
                'body' => '<p>Hello there, [user:to_name].</p><p><br></p><p>Please take a look at the attached file of your Admission Test Results. You may also check your FSUU OPIS account for the list of courses that you are qualified to enroll in. Please bring a printed copy of your results on the day of your enrollment along with your other pertinent documents.</p><p><br></p><p>Thank you for choosing Father Saturnino Urios University, and we warmly welcome you to be part of the Urian community.</p><p><br></p><p>Keep safe and healthy,</p><p><br></p><p>[email signature]</p><p><br></p><p><br></p><p>Disclaimer: This message may contain privileged and confidential information intended only for the use of the addressee named above. If you are not the intended recipient of this message you are hereby notified that any use, dissemination, distribution and or reproduction of this message is prohibited. If you have received this message by mistake, please notify the sender immediately and delete this email from your system.</p>',
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'STUDENT PROFILING REPORT',
                'subject' => 'FSUU GUIDANCE - Student Profiling Report',
                'body' => '<p>Please see the attached PDF, "Student Profiling Report.pdf"</p>',
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'MONITORING REPORT',
                'subject' => 'FSUU FACULTY: Monitoring Report',
                'body' => '<p>You have a new monitoring report uploaded by <strong>[user:monitored_by]</strong> on <strong>[user:date_monitored]</strong> at <strong>[user:time_monitored]</strong>.</p>',
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        EmailTemplate::insert($data);
    }
}