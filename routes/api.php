<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('api.access')->group(function () {

// Your API routes go here


Route::post('login', [App\Http\Controllers\AuthController::class, 'login']);


Route::middleware('auth:api')->group(function () {
    Route::get('check_auth_status', [App\Http\Controllers\AuthController::class, "check_auth_status"]);

    // UserController
    Route::post('existing_username', [App\Http\Controllers\UserController::class, "existing_username"]);

    Route::post('multiple_archived_user', [App\Http\Controllers\UserController::class, "multiple_archived_user"]);
    Route::post('user_profile_photo_update', [App\Http\Controllers\UserController::class, "user_profile_photo_update"]);
    Route::get('user_profile_info', [App\Http\Controllers\UserController::class, "user_profile_info"]);
    Route::post('user_profile_info_update', [App\Http\Controllers\UserController::class, "user_profile_info_update"]);
    Route::post('user_update_role', [App\Http\Controllers\UserController::class, "user_update_role"]);
    Route::post('user_deactivate', [App\Http\Controllers\UserController::class, "user_deactivate"]);
    Route::post('users_update_email', [App\Http\Controllers\UserController::class, "users_update_email"]);
    Route::post('users_update_password', [App\Http\Controllers\UserController::class, "users_update_password"]);
    Route::post('users_info_update_password', [App\Http\Controllers\UserController::class, "users_info_update_password"]);
    Route::post('add_user', [App\Http\Controllers\UserController::class, "add_user"]);
    Route::apiResource('users', App\Http\Controllers\UserController::class);
    // END UserController

    // UserPermissionController
    Route::post('user_permission_status', [App\Http\Controllers\UserPermissionController::class, 'user_permission_status']);
    Route::apiResource('user_permission', App\Http\Controllers\UserPermissionController::class);
    // END UserPermissionController

    // ModuleController
    Route::post('module_multi_update_permission_status', [App\Http\Controllers\ModuleController::class, 'module_multi_update_permission_status']);
    Route::post('module_update_permission_status', [App\Http\Controllers\ModuleController::class, 'module_update_permission_status']);
    Route::apiResource('module', App\Http\Controllers\ModuleController::class);
    // END ModuleController

    // UserRolePermissionController
    Route::apiResource('user_role_permission', App\Http\Controllers\UserRolePermissionController::class);
    // END UserRolePermissionController

    // EmailTemplateController
    Route::post('email_template_multiple', [App\Http\Controllers\EmailTemplateController::class, 'email_template_multiple']);
    Route::apiResource('email_template', App\Http\Controllers\EmailTemplateController::class);
    // END EmailTemplateController

    // NotificationTemplateController
    Route::post('notification_template_multiple', [App\Http\Controllers\NotificationTemplateController::class, 'notification_template_multiple']);
    Route::apiResource('notification_template', App\Http\Controllers\NotificationTemplateController::class);
    // END NotificationTemplateController

    // ProfileController
    Route::post('faculty_upload_excel', [App\Http\Controllers\ProfileController::class, "faculty_upload_excel"]);
    Route::post('student_subject_upload_excel', [App\Http\Controllers\ProfileController::class, "student_subject_upload_excel"]);
    Route::post('upload_signature', [App\Http\Controllers\ProfileController::class, "upload_signature"]);
    Route::post('profile_update', [App\Http\Controllers\ProfileController::class, "profile_update"]);
    Route::post('profile_deactivate', [App\Http\Controllers\ProfileController::class, "profile_deactivate"]);
    Route::post('profile_data_consent', [App\Http\Controllers\ProfileController::class, "profile_data_consent"]);
    Route::post('update_profile_photo', [App\Http\Controllers\ProfileController::class, "update_profile_photo"]);
    Route::post('profile_archived', [App\Http\Controllers\ProfileController::class, "profile_archived"]);
    Route::apiResource('profile', App\Http\Controllers\ProfileController::class);

    Route::apiResource('profile_address', App\Http\Controllers\ProfileAddressController::class);
    // END ProfileController

    // StudentExamQrController

    // END StudentExamQrController

    // StudentExamController
    Route::get('exam_result_preview', [App\Http\Controllers\StudentExamController::class, 'exam_result_preview']);
    Route::get('applicant_generate_qr_code', [App\Http\Controllers\StudentExamController::class, 'applicant_generate_qr_code']);

    Route::post('applicant_official_receipt', [App\Http\Controllers\StudentExamController::class, 'applicant_official_receipt']);
    Route::post('applicant_verify', [App\Http\Controllers\StudentExamController::class, 'applicant_verify']);
    Route::post('applicant_archived', [App\Http\Controllers\StudentExamController::class, 'applicant_archived']);
    Route::post('authorization_prompt', [App\Http\Controllers\StudentExamController::class, 'authorization_prompt']);
    Route::post('update_additional_information', [App\Http\Controllers\StudentExamController::class, 'update_additional_information']);
    Route::post('update_academic_profile', [App\Http\Controllers\StudentExamController::class, 'update_academic_profile']);
    Route::post('update_emergency_contact', [App\Http\Controllers\StudentExamController::class, 'update_emergency_contact']);
    Route::post('update_family_profile', [App\Http\Controllers\StudentExamController::class, 'update_family_profile']);
    Route::post('update_school_attended', [App\Http\Controllers\StudentExamController::class, 'update_school_attended']);
    Route::post('update_student_address', [App\Http\Controllers\StudentExamController::class, 'update_student_address']);

    Route::post('update_student_exam_schedule', [App\Http\Controllers\StudentExamController::class, 'update_student_exam_schedule']);
    Route::post('update_student_basic_info', [App\Http\Controllers\StudentExamController::class, 'update_student_basic_info']);

    Route::apiResource('student_exams', App\Http\Controllers\StudentExamController::class);
    // END StudentExamController

    // FACULTY LOAD

    // FacultyLoadMonitoringController
    Route::post('faculty_load_deduction', [App\Http\Controllers\FacultyLoadMonitoringController::class, 'faculty_load_deduction']);
    Route::post('faculty_load_monitoring_remarks', [App\Http\Controllers\FacultyLoadMonitoringController::class, 'faculty_load_monitoring_remarks']);
    Route::apiResource('faculty_load_monitoring', App\Http\Controllers\FacultyLoadMonitoringController::class);
    // END FacultyLoadMonitoringController

    // FacultyLoadController
    Route::post('faculty_load_subjects', [App\Http\Controllers\FacultyLoadController::class, 'faculty_load_subjects']);
    Route::post('faculty_load_update_data_error', [App\Http\Controllers\FacultyLoadController::class, 'faculty_load_update_data_error']);
    Route::post('grade_file_approval', [App\Http\Controllers\FacultyLoadController::class, 'grade_file_approval']);
    Route::post('faculty_load_status_bulk', [App\Http\Controllers\FacultyLoadController::class, 'faculty_load_status_bulk']);
    Route::post('faculty_load_status', [App\Http\Controllers\FacultyLoadController::class, 'faculty_load_status']);
    Route::post('faculty_load_update_room', [App\Http\Controllers\FacultyLoadController::class, 'faculty_load_update_room']);
    Route::post('faculty_load_upload', [App\Http\Controllers\FacultyLoadController::class, 'faculty_load_upload']);
    Route::post('faculty_load_multiple_archived', [App\Http\Controllers\FacultyLoadController::class, 'multiple_archived']);
    Route::apiResource('faculty_load', App\Http\Controllers\FacultyLoadController::class);
    // END FacultyLoadController

    Route::apiResource('faculty_load_schedule', App\Http\Controllers\FacultyLoadScheduleController::class);

    // FacultyLoadMonitoringJustificationController
    Route::post('flm_justification_approved', [App\Http\Controllers\FacultyLoadMonitoringJustificationController::class, 'flm_justification_approved']);
    Route::post('flm_justification_update_status', [App\Http\Controllers\FacultyLoadMonitoringJustificationController::class, 'flm_justification_update_status']);
    Route::post('flm_endorse_for_approval', [App\Http\Controllers\FacultyLoadMonitoringJustificationController::class, 'flm_endorse_for_approval']);
    Route::apiResource('flm_justification', App\Http\Controllers\FacultyLoadMonitoringJustificationController::class);
    // END FacultyLoadMonitoringJustificationController
    // END FACULTY LOAD

    // SCHEDULES
    // ScheduleController
    Route::post('schedule_archived', [App\Http\Controllers\ScheduleController::class, 'schedule_archived']);
    Route::apiResource('schedule', App\Http\Controllers\ScheduleController::class);
    // END ScheduleController

    // ScheduleDayTimeController
    Route::apiResource('schedule_day_time', App\Http\Controllers\ScheduleDayTimeController::class);
    // END ScheduleDayTimeController
    // END SCHEDULES

    // SETTINGS
    Route::get('region_dropdown', [App\Http\Controllers\RefRegionController::class, 'region_dropdown']);

    Route::post('multiple_archived_department', [App\Http\Controllers\RefDepartmentController::class, 'multiple_archived_department']);
    Route::post('multiple_archived_course', [App\Http\Controllers\RefCourseController::class, 'multiple_archived_course']);

    Route::get('document_filter_type', [App\Http\Controllers\DocumentController::class, 'document_filter_type']);
    Route::get('document_counts', [App\Http\Controllers\DocumentController::class, 'document_counts']);
    Route::get('tree_data_users', [App\Http\Controllers\DocumentController::class, 'tree_data_users']);
    Route::post('document_attach_signature', [App\Http\Controllers\DocumentSignatureController::class, 'document_attach_signature']);
    Route::post('document_read', [App\Http\Controllers\DocumentController::class, 'document_read']);
    Route::post('document_important', [App\Http\Controllers\DocumentController::class, 'document_important']);
    Route::post('document_archived', [App\Http\Controllers\DocumentController::class, 'document_archived']);
    Route::post('ecom_attachment_delete', [App\Http\Controllers\DocumentController::class, "ecom_attachment_delete"]);

    Route::apiResource('document_signature', App\Http\Controllers\DocumentSignatureController::class);
    Route::apiResource('document_forwarded', App\Http\Controllers\DocumentForwardedController::class);
    Route::apiResource('document_recipients', App\Http\Controllers\DocumentRecipientController::class);
    Route::apiResource('documents', App\Http\Controllers\DocumentController::class);
    Route::apiResource('user_role', App\Http\Controllers\UserRoleController::class);

    Route::get('building_with_children', [App\Http\Controllers\RefBuildingController::class, 'building_with_children']);
    Route::post('building_archived', [App\Http\Controllers\RefBuildingController::class, 'building_archived']);
    Route::apiResource('building', App\Http\Controllers\RefBuildingController::class);

    Route::post('floor_archived', [App\Http\Controllers\RefFloorController::class, 'floor_archived']);
    Route::apiResource('floor', App\Http\Controllers\RefFloorController::class);

    Route::post('room_archived', [App\Http\Controllers\RefRoomController::class, 'room_archived']);
    Route::apiResource('room', App\Http\Controllers\RefRoomController::class);

    Route::post('department_archived', [App\Http\Controllers\RefDepartmentController::class, 'department_archived']);
    Route::apiResource('department', App\Http\Controllers\RefDepartmentController::class);

    Route::post('exam_category_archived', [App\Http\Controllers\RefExamCategoryController::class, 'exam_category_archived']);
    Route::apiResource('exam_category', App\Http\Controllers\RefExamCategoryController::class);

    Route::post('course_archived', [App\Http\Controllers\RefCourseController::class, 'course_archived']);
    Route::apiResource('course', App\Http\Controllers\RefCourseController::class);

    Route::post('section_archived', [App\Http\Controllers\RefSectionController::class, 'section_archived']);
    Route::apiResource('section', App\Http\Controllers\RefSectionController::class);

    Route::post('subject_archived', [App\Http\Controllers\RefSubjectController::class, 'subject_archived']);
    Route::apiResource('subject', App\Http\Controllers\RefSubjectController::class);

    Route::post('status_category_archived', [App\Http\Controllers\RefStatusCategoryController::class, 'status_category_archived']);
    Route::apiResource('status_category', App\Http\Controllers\RefStatusCategoryController::class);

    Route::post('status_archived', [App\Http\Controllers\RefStatusController::class, 'status_archived']);
    Route::apiResource('status', App\Http\Controllers\RefStatusController::class);

    Route::post('time_schedule_archived', [App\Http\Controllers\RefTimeScheduleController::class, 'time_schedule_archived']);
    Route::apiResource('time_schedule', App\Http\Controllers\RefTimeScheduleController::class);

    Route::post('day_schedule_archived', [App\Http\Controllers\RefDayScheduleController::class, 'day_schedule_archived']);
    Route::apiResource('day_schedule', App\Http\Controllers\RefDayScheduleController::class);

    Route::post('school_year_archived', [App\Http\Controllers\RefSchoolYearController::class, 'school_year_archived']);
    Route::apiResource('school_year', App\Http\Controllers\RefSchoolYearController::class);

    Route::post('rate_archived', [App\Http\Controllers\RefRateController::class, 'rate_archived']);
    Route::apiResource('rate', App\Http\Controllers\RefRateController::class);

    Route::post('semester_archived', [App\Http\Controllers\RefSemesterController::class, 'semester_archived']);
    Route::apiResource('semester', App\Http\Controllers\RefSemesterController::class);

    Route::post('exam_schedule_archived', [App\Http\Controllers\RefExamScheduleController::class, 'exam_schedule_archived']);
    Route::apiResource('exam_schedule', App\Http\Controllers\RefExamScheduleController::class);

    Route::post('civil_status_archived', [App\Http\Controllers\RefCivilStatusController::class, 'civil_status_archived']);
    Route::apiResource('civilstatus', App\Http\Controllers\RefCivilStatusController::class);

    Route::post('nationality_archived', [App\Http\Controllers\RefNationalityController::class, 'nationality_archived']);
    Route::apiResource('nationality', App\Http\Controllers\RefNationalityController::class);

    Route::post('religion_archived', [App\Http\Controllers\RefReligionController::class, 'religion_archived']);
    Route::apiResource('religion', App\Http\Controllers\RefReligionController::class);

    Route::post('language_archived', [App\Http\Controllers\RefLanguageController::class, 'language_archived']);
    Route::apiResource('language', App\Http\Controllers\RefLanguageController::class);

    Route::post('region_archived', [App\Http\Controllers\RefRegionController::class, 'region_archived']);
    Route::apiResource('region', App\Http\Controllers\RefRegionController::class);

    Route::post('province_archived', [App\Http\Controllers\RefProvinceController::class, 'province_archived']);
    Route::apiResource('province', App\Http\Controllers\RefProvinceController::class);

    Route::post('municipality_archived', [App\Http\Controllers\RefMunicipalityController::class, 'municipality_archived']);
    Route::apiResource('municipality', App\Http\Controllers\RefMunicipalityController::class);

    Route::apiResource('barangay', App\Http\Controllers\RefBarangayController::class);

    Route::post('scholarship_archived', [App\Http\Controllers\RefScholarshipController::class, 'scholarship_archived']);
    Route::apiResource('scholarship', App\Http\Controllers\RefScholarshipController::class);

    Route::post('school_level_archived', [App\Http\Controllers\RefSchoolLevelController::class, 'school_level_archived']);
    Route::apiResource('school_level', App\Http\Controllers\RefSchoolLevelController::class);

    Route::post('school_archived', [App\Http\Controllers\RefSchoolController::class, 'school_archived']);
    Route::apiResource('school', App\Http\Controllers\RefSchoolController::class);

    Route::post('position_archived', [App\Http\Controllers\RefPositionController::class, 'position_archived']);
    Route::apiResource('position', App\Http\Controllers\RefPositionController::class);
    // END SETTINGS

    Route::get('grade_submision_graph', [App\Http\Controllers\GradeFileController::class, 'grade_submision_graph']);
    Route::post('grade_file_status', [App\Http\Controllers\GradeFileController::class, 'grade_file_status']);
    Route::post('grade_file_list', [App\Http\Controllers\GradeFileController::class, 'grade_file_list']);
    Route::apiResource('grade_file', App\Http\Controllers\GradeFileController::class);

    Route::apiResource('notifications', App\Http\Controllers\NotificationController::class);
    Route::post('update_notification', [App\Http\Controllers\NotificationUserController::class, 'update_notification']);
    Route::apiResource('user_notifications', App\Http\Controllers\NotificationUserController::class);

    Route::apiResource('form', App\Http\Controllers\FormController::class);
    Route::get('mobile_form', [App\Http\Controllers\FormController::class, 'mobile_form']);
    Route::post('form_change_status', [App\Http\Controllers\FormController::class, 'form_change_status']);
    Route::get('form_question_category_view_result/{id}', [App\Http\Controllers\FormQuestionCategoryController::class, 'form_question_category_view_result']);
    Route::post('form_question_category_order', [App\Http\Controllers\FormQuestionCategoryController::class, 'form_question_category_order']);
    Route::post('form_question_category_change_status', [App\Http\Controllers\FormQuestionCategoryController::class, 'form_question_category_change_status']);
    Route::apiResource('form_question_category', App\Http\Controllers\FormQuestionCategoryController::class);
    Route::apiResource('form_question_option', App\Http\Controllers\FormQuestionOptionController::class);

    Route::post('form_question_answer_bulk_store', [App\Http\Controllers\FormQuestionAnswerController::class, 'form_question_answer_bulk_store']);
    Route::apiResource('form_question_answer', App\Http\Controllers\FormQuestionAnswerController::class);

    Route::post('system_link_archived', [App\Http\Controllers\SystemLinkController::class, 'system_link_archived']);
    Route::apiResource('system_link', App\Http\Controllers\SystemLinkController::class);

    // always at the bottom
    // Route for graph here
    Route::get('faculty_load_monitoring_graph2', [App\Http\Controllers\Graph\FacultyLoadMonitoringGraph::class, 'faculty_load_monitoring_graph2']);
    Route::get('faculty_load_monitoring_graph', [App\Http\Controllers\Graph\FacultyLoadMonitoringGraph::class, 'faculty_load_monitoring_graph']);
    Route::get('faculty_load_monitoring_faculty_absent_present_graph', [App\Http\Controllers\Graph\FacultyLoadMonitoringGraph::class, 'faculty_load_monitoring_faculty_absent_present_graph']);
    Route::get('faculty_load_monitoring_faculty_department_top_graph', [App\Http\Controllers\Graph\FacultyLoadMonitoringGraph::class, 'faculty_load_monitoring_faculty_department_top_graph']);
    Route::get('faculty_load_monitoring_faculty_top_graph', [App\Http\Controllers\Graph\FacultyLoadMonitoringGraph::class, 'faculty_load_monitoring_faculty_top_graph']);
    Route::get('faculty_load_monitoring_list_graph', [App\Http\Controllers\Graph\FacultyLoadMonitoringStatusListGraph::class, 'index']);
    // end Route for graph here

    Route::apiResource('data_imports', App\Http\Controllers\DataImportController::class);

    Route::post('data_import_detail_multiple', [App\Http\Controllers\DataImportDetailController::class, 'data_import_detail_multiple']);
    Route::apiResource('data_import_detail', App\Http\Controllers\DataImportDetailController::class);
});

Route::get('test_pass', function () {
    echo Hash::make('Admin123!');
});
