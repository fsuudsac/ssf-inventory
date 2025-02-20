<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Profile extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function scopeEmploymentTypeFullTime($query)
    {
        return $query->where('employment_type', 'Full-Time');
    }

    public function scopeEmploymentTypePartTime($query)
    {
        return $query->where('employment_type', 'Part-Time');
    }

    public function user()
    {
        return $this->belongsTo(User::class, "user_id");
    }

    public function ref_civil_status()
    {
        return $this->belongsTo(RefCivilStatus::class, "civil_status_id");
    }

    public function ref_nationality()
    {
        return $this->belongsTo(RefNationality::class, "nationality_id");
    }

    public function ref_religion()
    {
        return $this->belongsTo(RefReligion::class, "religion_id");
    }

    public function student_academics()
    {
        return $this->hasMany(StudentAcademic::class, "profile_id");
    }

    public function profile_insurances()
    {
        return $this->hasMany(ProfileInsurance::class, "profile_id");
    }

    public function profile_health_informations()
    {
        return $this->hasMany(ProfileHealthInformation::class, "profile_id");
    }

    public function profile_contact_informations()
    {
        return $this->hasMany(ProfileContactInformation::class, "profile_id");
    }

    public function profile_languages()
    {
        return $this->hasMany(ProfileLanguage::class, "profile_id");
    }

    public function profile_addresses()
    {
        return $this->hasMany(ProfileAddress::class, "profile_id");
    }

    public function profile_spouses()
    {
        return $this->hasMany(ProfileSpouse::class, "profile_id");
    }
    public function profile_childrens()
    {
        return $this->hasMany(ProfileChildren::class, "profile_id");
    }

    public function profile_departments()
    {
        return $this->hasMany(ProfileDepartment::class, "profile_id");
    }

    public function profile_parent_informations()
    {
        return $this->hasMany(ProfileParentInformation::class, "profile_id");
    }

    public function profile_work_experiences()
    {
        return $this->hasMany(ProfileWorkExperience::class, "profile_id");
    }

    public function profile_beneficiaries()
    {
        return $this->hasMany(ProfileBenificiary::class, "profile_id");
    }

    public function profile_training_certificates()
    {
        return $this->hasMany(ProfileTrainingCertificate::class, "profile_id");
    }

    public function profile_school_attendeds()
    {
        return $this->hasMany(ProfileSchoolAttended::class, "profile_id");
    }

    public function profile_others()
    {
        return $this->hasMany(ProfileOther::class, "profile_id");
    }

    public function faculty_loads()
    {
        return $this->hasMany(FacultyLoad::class, "profile_id");
    }

    public function document_recipients()
    {
        return $this->hasMany(DocumentRecipient::class, "recipient_id");
    }

    public function student_exam_qrs()
    {
        return $this->hasMany(StudentExamQr::class, "profile_id");
    }

    public function form_question_answers()
    {
        return $this->hasMany(FormQuestionAnswer::class, "profile_id");
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachmentable');
    }

    public function historyData()
    {
        return $this->morphMany(HistoryData::class, 'historyable');
    }
}